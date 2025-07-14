from apps.common.models import BaseViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role

from apps.checkout.models import OrderProcessingNote
from apps.checkout.serializers import OrderProcessingNoteSerializer


class OrderProcessingNoteViewSet(BaseViewSet):
    queryset = OrderProcessingNote.objects.select_related("order", "staff_member")
    serializer_class = OrderProcessingNoteSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = [
        "order__order_number",
        "note",
        "note_type",
        "staff_member__email",
        "staff_member__username",
        "staff_member__first_name",
        "staff_member__last_name",
        "order__user__email",
        "order__user__username",
    ]
    filterset_fields = ["id"]
    ordering_fields = [
        "id",
        "created_at",
        "updated_at",
        "note_type",
        "order__id",
        "order__order_number",
        "order__status",
        "order__total",
        "staff_member__email",
        "staff_member__username",
        "staff_member__first_name",
        "staff_member__last_name",
        "order__user__email",
        "order__user__username",
        "order__user__first_name",
        "order__user__last_name",
    ]
    ordering = ["-created_at"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.EMPLOYEE, Profile.Role.ADMIN})]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        if role in {Profile.Role.ADMIN, Profile.Role.EMPLOYEE}:
            return self.queryset
        return self.queryset.filter(order__user=self.request.user)
