from django.http import HttpResponse
from apps.common.models import BaseViewSet
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import (
    extend_schema,
    inline_serializer,
    OpenApiResponse,
    OpenApiTypes,
    OpenApiParameter,
)
from rest_framework import serializers
from django_filters.rest_framework import DjangoFilterBackend

from apps.checkout.models import InvoiceTemplate, Invoice, Order
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role
from apps.checkout.serializers.invoice import (
    InvoiceTemplateSerializer,
    InvoiceSerializer,
)
from apps.checkout.serializers.template_variables import (
    TemplateVariablesResponseSerializer,
)
from apps.checkout.services.template_validator import TemplateValidator
from apps.checkout.services.invoice_template_service import InvoiceTemplateService
from apps.checkout.services.invoice_creation_service import InvoiceCreationService


class InvoiceTemplateViewSet(BaseViewSet):
    """ViewSet for managing invoice templates."""

    queryset = InvoiceTemplate.objects.all()
    serializer_class = InvoiceTemplateSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = ["name", "description"]
    ordering_fields = [
        "id",
        "name",
        "description",
        "created_at",
        "updated_at",
        "is_default",
    ]
    ordering = ["name"]
    pagination_class = None

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    def update(self, request, *args, **kwargs):
        if request.data.get("is_default", False):
            InvoiceTemplate.objects.filter(is_default=True).update(is_default=False)
        return super().update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        if request.data.get("is_default", False):
            InvoiceTemplate.objects.filter(is_default=True).update(is_default=False)
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Validate template syntax and security",
        description="Validates Jinja2 template syntax and checks for forbidden properties",
        responses={
            200: inline_serializer(
                name="TemplateValidationResponse",
                fields={
                    "is_valid": serializers.BooleanField(),
                    "errors": serializers.ListField(child=serializers.CharField()),
                },
            ),
            400: inline_serializer(
                name="TemplateValidationError",
                fields={
                    "error": serializers.CharField(),
                },
            ),
        },
    )
    @extend_schema(
        summary="Get available template variables",
        description="Returns all available variables that can be used in templates",
        responses={200: TemplateVariablesResponseSerializer},
    )
    @action(detail=False, methods=["get"])
    def variables(self, request):
        """Get available template variables."""
        try:
            variables = {}

            for (
                model_name,
                properties,
            ) in TemplateValidator.ALLOWED_MODEL_PROPERTIES.items():
                variables[model_name] = list(properties)

            return Response(
                {
                    "variables": variables,
                }
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class InvoiceViewSet(BaseViewSet):
    """ViewSet for managing invoices."""

    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = [
        "invoice_number",
        "order__order_number",
        "order__user__email",
        "order__user__username",
        "order__shipping_address__address_line_1",
        "order__shipping_address__city",
        "order__shipping_address__postal_code",
        "order__shipping_address__country__name",
    ]
    ordering_fields = [
        "id",
        "invoice_number",
        "total_amount",
        "created_at",
        "updated_at",
        "order__id",
        "order__order_number",
        "order__status",
        "order__total",
        "order__user__email",
        "order__user__username",
        "order__user__first_name",
        "order__user__last_name",
        "order__created_at",
    ]
    ordering = ["-created_at"]
    pagination_class = None

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN, Profile.Role.EMPLOYEE})]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        if role in [Profile.Role.ADMIN, Profile.Role.EMPLOYEE]:
            return self.queryset
        return self.queryset.filter(order__user=self.request.user)

    @extend_schema(
        summary="Download invoice PDF by order",
        description="Downloads the PDF invoice for a specific order",
        parameters=[
            OpenApiParameter(
                name="order_id",
                type=int,
                location=OpenApiParameter.QUERY,
                required=True,
                description="ID of the order to generate invoice for",
            )
        ],
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.BINARY,
                description="Invoice PDF file.",
            ),
            404: inline_serializer(
                name="InvoiceNotFound",
                fields={
                    "error": serializers.CharField(),
                },
            ),
        },
    )
    @action(detail=False, methods=["get"])
    def download_by_order(self, request):
        """Download PDF invoice by order ID."""
        order_id = request.query_params.get("order_id")
        if not order_id:
            return Response(
                {"error": "order_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_role = get_user_role(request.user)
            orders_qs = (
                Order.objects.all()
                if user_role in [Profile.Role.ADMIN, Profile.Role.EMPLOYEE]
                else Order.objects.filter(user=request.user)
            )
            order = orders_qs.get(id=order_id)
            invoice = InvoiceCreationService.create_invoice_for_order_if_needed(order)

            pdf_content = InvoiceTemplateService.generate_pdf(invoice.html_content)
            response = HttpResponse(pdf_content, content_type="application/pdf")
            response["Content-Disposition"] = (
                f'attachment; filename="invoice_{invoice.invoice_number}.pdf"'
            )
            return response

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
