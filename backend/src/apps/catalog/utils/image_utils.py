import os
from PIL import Image
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import uuid


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename to prevent conflicts."""
    name, ext = os.path.splitext(original_filename)
    unique_id = str(uuid.uuid4())[:8]
    return f"{name}_{unique_id}{ext}"


def create_image_thumbnails(image_field, sizes: list[tuple[int, int]] = None) -> dict[str, str]:
    """
    Create thumbnails of different sizes for an image.
    
    Args:
        image_field: Django ImageField instance
        sizes: List of (width, height) tuples for thumbnails
        
    Returns:
        Dict with thumbnail paths
    """
    if sizes is None:
        sizes = [
            (150, 150),  # Small thumbnail
            (300, 300),  # Medium thumbnail
            (600, 600),  # Large thumbnail
        ]
    
    thumbnails = {}
    
    if not image_field:
        return thumbnails
    
    try:
        # Open the original image
        with Image.open(image_field) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Create thumbnails
            for width, height in sizes:
                # Create thumbnail maintaining aspect ratio
                thumbnail = img.copy()
                thumbnail.thumbnail((width, height), Image.Resampling.LANCZOS)
                
                # Generate filename
                original_path = image_field.name
                name, ext = os.path.splitext(original_path)
                thumbnail_name = f"{name}_thumb_{width}x{height}{ext}"
                
                # Save thumbnail
                thumbnail_path = os.path.join(settings.MEDIA_ROOT, thumbnail_name)
                thumbnail.save(thumbnail_path, 'JPEG', quality=85, optimize=True)
                
                thumbnails[f"{width}x{height}"] = thumbnail_name
                
    except Exception as e:
        print(f"Error creating thumbnails: {e}")
    
    return thumbnails


def optimize_image(image_field, max_size: tuple[int, int] = (1200, 1200), quality: int = 85):
    """
    Optimize an image by resizing and compressing.
    
    Args:
        image_field: Django ImageField instance
        max_size: Maximum (width, height) for the image
        quality: JPEG quality (1-100)
    """
    if not image_field:
        return
    
    try:
        with Image.open(image_field) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Resize if too large
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            image_field.save(
                image_field.name,
                ContentFile(b''),  # This will be replaced by the actual content
                save=False
            )
            
            # Save the optimized image
            img.save(image_field.path, 'JPEG', quality=quality, optimize=True)
            
    except Exception as e:
        print(f"Error optimizing image: {e}")


def get_image_url(image_field, size: str = None) -> str:
    """
    Get the URL for an image, optionally with a specific size.
    
    Args:
        image_field: Django ImageField instance
        size: Size key (e.g., '150x150', '300x300')
        
    Returns:
        Full URL to the image
    """
    if not image_field:
        return None
    
    if size:
        # Try to get thumbnail
        original_path = image_field.name
        name, ext = os.path.splitext(original_path)
        thumbnail_name = f"{name}_thumb_{size}{ext}"
        
        if default_storage.exists(thumbnail_name):
            return f"{settings.MEDIA_URL}{thumbnail_name}"
    
    return f"{settings.MEDIA_URL}{image_field.name}"
