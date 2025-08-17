from django.http import HttpResponse
from django.contrib.auth.decorators import permission_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiResponse, OpenApiTypes, OpenApiParameter, OpenApiTypes
from rest_framework import serializers

from apps.checkout.models import InvoiceTemplate, Invoice, Order
from apps.checkout.serializers.invoice import InvoiceTemplateSerializer, InvoiceSerializer
from apps.checkout.services.invoice_template_service import InvoiceTemplateService
from apps.checkout.services.template_validator import TemplateValidator
from apps.checkout.services.invoice_creation_service import InvoiceCreationService

# @method_decorator(permission_required('checkout.view_invoicetemplate'), name='list')
# @method_decorator(permission_required('checkout.view_invoicetemplate'), name='retrieve')
# @method_decorator(permission_required('checkout.add_invoicetemplate'), name='create')
# @method_decorator(permission_required('checkout.change_invoicetemplate'), name='update')
# @method_decorator(permission_required('checkout.change_invoicetemplate'), name='partial_update')
# @method_decorator(permission_required('checkout.delete_invoicetemplate'), name='destroy')
class InvoiceTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing invoice templates."""
    
    queryset = InvoiceTemplate.objects.all()
    serializer_class = InvoiceTemplateSerializer
    pagination_class = None

    
    @extend_schema(
        summary="Validate template syntax and security",
        description="Validates Jinja2 template syntax and checks for forbidden properties",
        responses={
            200: inline_serializer(
                name='TemplateValidationResponse',
                fields={
                    'is_valid': serializers.BooleanField(),
                    'errors': serializers.ListField(child=serializers.CharField()),
                }
            ),
            400: inline_serializer(
                name='TemplateValidationError',
                fields={
                    'error': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """Validate template syntax and security."""
        template = self.get_object()
        
        try:
            is_valid, errors = TemplateValidator.validate_template(template.content)
            
            return Response({
                'is_valid': is_valid,
                'errors': errors,
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Get available template variables",
        description="Returns all available variables that can be used in templates",
        responses={
            200: inline_serializer(
                name='TemplateVariablesResponse',
                fields={
                    'variables': serializers.DictField(
                        child=serializers.ListField(child=serializers.CharField())
                    ),
                }
            ),
        }
    )
    @action(detail=False, methods=['get'])
    def variables(self, request):
        """Get available template variables."""
        try:
            variables = {}
            
            for model_name, properties in TemplateValidator.ALLOWED_MODEL_PROPERTIES.items():
                variables[model_name] = list(properties)
            
            return Response({
                'variables': variables,
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

# @method_decorator(permission_required('checkout.view_invoice'), name='list')
# @method_decorator(permission_required('checkout.view_invoice'), name='retrieve')
# @method_decorator(permission_required('checkout.add_invoice'), name='create')
# @method_decorator(permission_required('checkout.change_invoice'), name='update')
# @method_decorator(permission_required('checkout.change_invoice'), name='partial_update')
# @method_decorator(permission_required('checkout.delete_invoice'), name='destroy')
class InvoiceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing invoices."""
    
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    pagination_class = None


    
    @extend_schema(
        summary="Download invoice PDF by order",
        description="Downloads the PDF invoice for a specific order",
        parameters=[
            OpenApiParameter(
                name='order_id',
                type=int,
                location=OpenApiParameter.QUERY,
                required=True,
                description='ID of the order to generate invoice for'
            )
        ],
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.BINARY,
                description="Invoice PDF file.",
            ),
            404: inline_serializer(
                name='InvoiceNotFound',
                fields={
                    'error': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=False, methods=['get'])
    def download_by_order(self, request):
        """Download PDF invoice by order ID."""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'error': 'order_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            order = Order.objects.get(id=order_id)
            invoice = InvoiceCreationService.create_invoice_for_order_if_needed(order)
            
            # Generate PDF
            pdf_content = InvoiceTemplateService.generate_pdf(invoice.html_content)
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="invoice_{invoice.invoice_number}.pdf"'
            return response
            
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Debug template rendering",
        description="Debug template rendering for a specific order",
        parameters=[
            OpenApiParameter(
                name='order_id',
                type=int,
                location=OpenApiParameter.QUERY,
                required=True,
                description='ID of the order to debug'
            )
        ],
        responses={
            200: inline_serializer(
                name='TemplateDebugResponse',
                fields={
                    'context': serializers.DictField(),
                    'rendered_html': serializers.CharField(),
                }
            ),
            404: inline_serializer(
                name='OrderNotFound',
                fields={
                    'error': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=False, methods=['get'])
    def debug_template(self, request):
        """Debug template rendering for a specific order."""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'error': 'order_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            order = Order.objects.get(id=order_id)
            
            # Get default template
            default_template = InvoiceTemplate.objects.filter(is_default=True).first()
            if not default_template:
                return Response(
                    {'error': 'No default template found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Build context
            context = InvoiceTemplateService._build_context(order)
            
            # Render template
            rendered_html = InvoiceTemplateService.render_invoice(
                default_template.content, 
                context
            )
            
            return Response({
                'context': {
                    'order_id': order.id,
                    'order_number': order.order_number,
                    'order_items_count': len(context.get('order_items', [])),
                    'order_items': [
                        {
                            'id': item.id,
                            'product_name': item.product.name if item.product else 'Unknown',
                            'quantity': item.quantity,
                            'unit_price': str(item.unit_price),
                            'total_price': str(item.total_price)
                        }
                        for item in context.get('order_items', [])
                    ],
                    'user': {
                        'id': context.get('user').id,
                        'username': context.get('user').username,
                        'email': context.get('user').email
                    } if context.get('user') else None
                },
                'rendered_html': rendered_html
            })
            
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

