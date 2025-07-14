from typing import Dict, Any
from jinja2 import Template
from .template_validator import TemplateValidator
import pdfkit


class InvoiceTemplateService:
    """Service for rendering invoice templates and generating PDFs."""

    @classmethod
    def render_invoice(cls, template_content: str, context: Dict[str, Any]) -> str:
        """
        Render invoice template with context data.

        Args:
            template_content: Jinja2 template content
            context: Data context for template variables

        Returns:
            Rendered HTML string
        """
        is_valid, errors = TemplateValidator.validate_template(template_content)
        if not is_valid:
            raise ValueError(f"Invalid template: {', '.join(errors)}")

        template = Template(template_content)
        return template.render(**context)

    @classmethod
    def generate_pdf(cls, html_content: str, filename: str = None) -> bytes:
        """
        Generate PDF from HTML content using pdfkit.

        Args:
            html_content: Rendered HTML string
            filename: Optional filename for the PDF

        Returns:
            PDF content as bytes
        """
        try:
            if not html_content.strip():
                raise ValueError("HTML content is empty")

            if "<style>" not in html_content and "<link" not in html_content:
                html_content = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {{ font-family: Arial, sans-serif; margin: 20px; }}
                        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                        th {{ background-color: #f2f2f2; }}
                        .header {{ text-align: center; margin-bottom: 30px; }}
                        .total {{ font-weight: bold; margin-top: 20px; }}
                    </style>
                </head>
                <body>
                    {html_content}
                </body>
                </html>
                """

            options = {
                "page-size": "A4",
                "margin-top": "0.75in",
                "margin-right": "0.75in",
                "margin-bottom": "0.75in",
                "margin-left": "0.75in",
                "encoding": "UTF-8",
                "no-outline": None,
                "enable-local-file-access": None,
                "disable-smart-shrinking": None,
                "print-media-type": None,
                "dpi": 300,
                "image-quality": 100,
                "javascript-delay": 1000,
                "no-stop-slow-scripts": None,
                "load-error-handling": "ignore",
                "load-media-error-handling": "ignore",
            }

            pdf_bytes = pdfkit.from_string(html_content, False, options=options)
            if not pdf_bytes or len(pdf_bytes) < 100:
                raise RuntimeError("Generated PDF is too small or empty")

            return pdf_bytes

        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"PDF generation failed: {str(e)}")
            logger.error(
                f"HTML content length: {len(html_content) if html_content else 0}"
            )

            raise RuntimeError(f"Failed to generate PDF: {str(e)}")

    @classmethod
    def _build_context(cls, order) -> Dict[str, Any]:
        """
        Build context for invoice template rendering.

        Args:
            order: Order instance

        Returns:
            Context dictionary for template
        """
        order_items = order.items.all()

        context = {
            "order": order,
            "order_items": order_items,
            "user": order.user,
            "shipping_address": order.shipping_address,
            "shipping_method": order.shipping_method,
        }

        return context
