import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("checkout", "0006_cartstatus_courier_alter_order_status_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="shippingmethod",
            name="courier",
            field=models.ForeignKey(
                default=2,
                help_text="Courier company providing this shipping method",
                on_delete=django.db.models.deletion.PROTECT,
                related_name="shipping_methods",
                to="checkout.courier",
            ),
        ),
    ]
