from django.db import models
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from django.db.models import ProtectedError
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass


class TimestampedModel(models.Model):
    """Abstract base model that provides timestamp fields."""

    created_at: models.DateTimeField = models.DateTimeField(
        auto_now_add=True, help_text="Timestamp when the record was created"
    )
    updated_at: models.DateTimeField = models.DateTimeField(
        auto_now=True, help_text="Timestamp when the record was last updated"
    )

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class BaseViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet with built-in ProtectedError handling for delete operations.
    All ViewSets should inherit from this instead of ModelViewSet directly.
    """
    
    @extend_schema(
        responses={
            204: {
                "description": "Item has been deleted successfully"
            },
            500: {
                "description": "Server error - cannot delete due to foreign key constraints",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "detail": {"type": "string"}
                            }
                        }
                    }
                }
            }
        }
    )
    def destroy(self, request, *args, **kwargs):
        """Handle deletion with foreign key constraint protection."""
        try:
            instance = self.get_object()
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            return Response(
                {"detail": f"Cannot delete this item because it's being used by other items. {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
