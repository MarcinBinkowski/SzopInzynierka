from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("profile", "0002_address"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="address",
            name="unique_default_address_per_profile",
        ),
    ]
