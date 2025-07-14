from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("checkout", "0010_invoicetemplate_invoice"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name="invoice",
            name="generated_by",
        ),
        migrations.RemoveField(
            model_name="invoice",
            name="template",
        ),
        migrations.AddField(
            model_name="invoice",
            name="html_content",
            field=models.TextField(
                default=1, help_text="Rendered HTML content of the invoice"
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="invoicetemplate",
            name="is_default",
            field=models.BooleanField(
                default=False,
                help_text="Use as default template for automatic invoice generation",
            ),
        ),
        migrations.AddConstraint(
            model_name="invoicetemplate",
            constraint=models.UniqueConstraint(
                condition=models.Q(("is_default", True)),
                fields=("is_default",),
                name="unique_default_template",
            ),
        ),
    ]
