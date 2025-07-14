import { createFileRoute, useParams } from "@tanstack/react-router";
import { useCheckoutOrdersRetrieve } from "@/api/generated/shop/checkout/checkout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { checkoutInvoicesDownloadByOrderRetrieve } from "@/api/generated/shop/checkout/checkout";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/orders/$orderId/")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = useParams({ from: "/_authenticated/orders/$orderId/" });
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useCheckoutOrdersRetrieve(orderId);

  const downloadInvoiceMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const blob = await checkoutInvoicesDownloadByOrderRetrieve({
        order_id: orderId,
      });
      return blob;
    },
    onSuccess: (blob, orderId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Invoice downloaded for order ${orderId}`);
    },
    onError: (error) => {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Loading order...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load order</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: "/orders" })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
          <p className="text-muted-foreground">Order details and information</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: "/orders" })} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <Button onClick={() => downloadInvoiceMutation.mutate(order.id)}>
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Basic order information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="text-lg font-semibold">{order.status}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <div className="text-lg">
                {new Date(order.created_at).toLocaleDateString()}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Subtotal
              </label>
              <div className="text-lg font-semibold">${order.subtotal}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Total
              </label>
              <div className="text-lg font-bold text-green-600">
                ${order.total}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.items && order.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>Products in this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product?.primary_image ? (
                        <img
                          src={item.product.primary_image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {item.product?.name || `Product #${item.product?.id}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${item.unit_price}</div>
                    <div className="text-sm text-muted-foreground">
                      Total: ${item.total_price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
          <CardDescription>Delivery details and method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Shipping Address
              </label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                {order.shipping_address ? (
                  <div>
                    <div className="font-medium">
                      {order.shipping_address.full_address}
                    </div>
                    {order.shipping_address.label && (
                      <div className="text-sm text-muted-foreground">
                        Label: {order.shipping_address.label}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    No shipping address
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Shipping Method
              </label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                {order.shipping_method ? (
                  <div>
                    <div className="font-medium">
                      {order.shipping_method.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cost: ${order.shipping_cost}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    No shipping method
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Coupons, discounts, and notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Applied Coupon
              </label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                {order.applied_coupon ? (
                  <div>
                    <div className="font-medium">
                      {order.applied_coupon.code}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Discount: ${order.coupon_discount}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No coupon applied</div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Notes
              </label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                {order.notes ? (
                  <div className="whitespace-pre-wrap">{order.notes}</div>
                ) : (
                  <div className="text-muted-foreground">No notes</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
