import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCatalogImagesList,
  useCatalogImagesCreate,
  useCatalogImagesDestroy,
  useCatalogImagesSetPrimaryCreate,
} from "@/api/generated/shop/catalog/catalog";
import { toast } from "sonner";
import { Upload, X, Star, StarOff, Image } from "lucide-react";

interface ProductImageUploadProps {
  productId: number;
  disabled?: boolean;
}

export function ProductImageUpload({
  productId,
  disabled,
}: ProductImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: images, refetch } = useCatalogImagesList({
    product: productId,
  });
  const createMutation = useCatalogImagesCreate();
  const deleteMutation = useCatalogImagesDestroy();
  const setPrimaryMutation = useCatalogImagesSetPrimaryCreate();

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      const MAX_MB = 10;
      const accepted = files.filter((f) => {
        const okType = f.type.startsWith("image/");
        const okSize = f.size <= MAX_MB * 1024 * 1024;
        if (!okType) toast.error(`${f.name}: not an image`);
        if (!okSize) toast.error(`${f.name}: over ${MAX_MB}MB`);
        return okType && okSize;
      });

      try {
        for (const file of accepted) {
          await createMutation.mutateAsync({
            data: {
              image: file,
              product: productId,
            } as any,
          });
          toast.success(`Uploaded ${file.name}`);
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Some uploads failed");
      } finally {
        refetch();
      }
    },
    [createMutation, productId, refetch],
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      uploadFiles(Array.from(files));
      event.currentTarget.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    uploadFiles(files);
  };

  const handleDelete = async (imageId: number) => {
    try {
      await deleteMutation.mutateAsync({ id: imageId });
      toast.success("Image deleted");
      refetch();
    } catch {
      toast.error("Failed to delete image");
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await setPrimaryMutation.mutateAsync({ id: imageId });
      toast.success("Primary image updated");
      refetch();
    } catch {
      toast.error("Failed to set primary image");
    }
  };

  const busy =
    (createMutation as any).isPending ||
    (deleteMutation as any).isPending ||
    (setPrimaryMutation as any).isPending;

  const isDisabled = disabled || !!busy;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-md flex flex-col items-center justify-center py-8 px-4 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="sr-only"
              id="image-upload"
              disabled={isDisabled}
            />
            <Upload
              className="mx-auto mb-2 text-gray-400"
              width="40"
              height="40"
            />
            <p className="text-sm text-gray-600 mb-1">
              {dragActive
                ? "Drop images here..."
                : "Drag & drop images here, or click to select"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB each
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              disabled={isDisabled}
              onClick={() => fileInputRef.current?.click()}
            >
              Select Images
            </Button>
          </div>
        </CardContent>
      </Card>

      {images && images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <img
                    src={image.image_url || undefined}
                    alt="Product image"
                    className="w-full h-full object-cover rounded"
                  />

                  {image.is_primary && (
                    <div className="absolute top-1 left-1 bg-yellow-500 text-white px-1 py-0.5 rounded text-xs">
                      Primary
                    </div>
                  )}

                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant={image.is_primary ? "secondary" : "outline"}
                      onClick={() => handleSetPrimary(image.id)}
                      className="h-6 w-6 p-0"
                      disabled={isDisabled}
                    >
                      {image.is_primary ? (
                        <StarOff className="h-3 w-3" />
                      ) : (
                        <Star className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      className="h-6 w-6 p-0"
                      disabled={isDisabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images && images.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Image className="mx-auto mb-2" width="40" height="40" />
              <p>No images uploaded yet</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
