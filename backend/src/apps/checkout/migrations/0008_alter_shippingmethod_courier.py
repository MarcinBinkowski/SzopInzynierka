import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("checkout", "0007_shippingmethod_courier"),
    ]

    operations = [
        migrations.AlterField(
            model_name="shippingmethod",
            name="courier",
            field=models.ForeignKey(
                help_text="Courier company providing this shipping method",
                on_delete=django.db.models.deletion.PROTECT,
                related_name="shipping_methods",
                to="checkout.courier",
            ),
        ),
    ]
