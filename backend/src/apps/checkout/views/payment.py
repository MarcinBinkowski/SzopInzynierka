from apps.common.models import BaseViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.checkout.models import Payment
from apps.checkout.serializers import PaymentSerializer
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role


class PaymentViewSet(BaseViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = [
        "stripe_payment_intent_id",
        "description",
        "status",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
    ]
    filterset_fields = ["id"]
    ordering_fields = [
        "id",
        "status",
        "amount",
        "created_at",
        "updated_at",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
        "stripe_payment_intent_id",
    ]
    ordering = ["-created_at"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.EMPLOYEE, Profile.Role.ADMIN})]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        if role in {Profile.Role.ADMIN, Profile.Role.EMPLOYEE}:
            return self.queryset
        return self.queryset.filter(user=self.request.user)
