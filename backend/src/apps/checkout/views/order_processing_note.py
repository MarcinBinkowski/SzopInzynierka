from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS

from apps.checkout.models import OrderProcessingNote
from apps.checkout.serializers import OrderProcessingNoteSerializer


class OrderProcessingNoteViewSet(viewsets.ModelViewSet):
    queryset = OrderProcessingNote.objects.select_related("order", "staff_member")
    serializer_class = OrderProcessingNoteSerializer
    permission_classes = []
    filterset_fields = ["order", "staff_member"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()]


