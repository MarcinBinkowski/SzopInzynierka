from rest_framework import viewsets

from apps.checkout.models import Payment
from apps.checkout.serializers import PaymentSerializer
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filterset_fields = ["status", "user"]
    ordering_fields = ["created_at", "amount"]
    ordering = ["-created_at"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.EMPLOYEE, Profile.Role.ADMIN})]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        if role in {Profile.Role.ADMIN, Profile.Role.EMPLOYEE}:
            return self.queryset
        return self.queryset.filter(user=self.request.user)
