from rest_framework import viewsets
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role

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
        return [ReadOnlyOrRoles({Profile.Role.EMPLOYEE, Profile.Role.ADMIN})]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        if role in {Profile.Role.ADMIN, Profile.Role.EMPLOYEE}:
            return self.queryset
        return self.queryset.filter(order__user=self.request.user)
