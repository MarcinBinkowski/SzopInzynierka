from django.http import HttpResponse

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import (
    extend_schema,
    inline_serializer,
    OpenApiResponse,
    OpenApiTypes,
    OpenApiParameter,
)
from rest_framework import serializers

from apps.checkout.models import InvoiceTemplate, Invoice, Order
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role
from apps.checkout.serializers.invoice import (
    InvoiceTemplateSerializer,
    InvoiceSerializer,
)
from apps.checkout.services.invoice_template_service import InvoiceTemplateService
from apps.checkout.services.template_validator import TemplateValidator
from apps.checkout.services.invoice_creation_service import InvoiceCreationService


class InvoiceTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing invoice templates."""

    queryset = InvoiceTemplate.objects.all()
    serializer_class = InvoiceTemplateSerializer
    pagination_class = None

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

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
    @action(detail=True, methods=["post"])
    def validate(self, request, pk=None):
        """Validate template syntax and security."""
        template = self.get_object()

        try:
            is_valid, errors = TemplateValidator.validate_template(template.content)

            return Response(
                {
                    "is_valid": is_valid,
                    "errors": errors,
                }
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Get available template variables",
        description="Returns all available variables that can be used in templates",
        responses={
            200: inline_serializer(
                name="TemplateVariablesResponse",
                fields={
                    "variables": serializers.DictField(
                        child=serializers.ListField(child=serializers.CharField())
                    ),
                },
            ),
        },
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


class InvoiceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing invoices."""

    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    pagination_class = None

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

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
            orders_qs = (
                Order.objects.all()
                if get_user_role(request.user) == Profile.Role.ADMIN
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
