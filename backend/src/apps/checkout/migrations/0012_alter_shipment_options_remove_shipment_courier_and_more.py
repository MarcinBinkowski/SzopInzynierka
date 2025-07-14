from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        (
            "checkout",
            "0011_remove_invoice_generated_by_remove_invoice_template_and_more",
        ),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="shipment",
            options={
                "ordering": ["-created_at"],
                "verbose_name": "Shipment",
                "verbose_name_plural": "Shipments",
            },
        ),
        migrations.RemoveField(
            model_name="shipment",
            name="courier",
        ),
        migrations.RemoveField(
            model_name="shipment",
            name="shipping_method",
        ),
        migrations.AlterField(
            model_name="shipment",
            name="shipped_at",
            field=models.DateTimeField(
                blank=True, help_text="When the package was shipped", null=True
            ),
        ),
    ]
