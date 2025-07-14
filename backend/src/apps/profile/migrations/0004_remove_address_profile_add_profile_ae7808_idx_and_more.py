from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("profile", "0003_remove_address_unique_default_address_per_profile"),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name="address",
            name="profile_add_profile_ae7808_idx",
        ),
        migrations.RemoveField(
            model_name="address",
            name="address_type",
        ),
        migrations.AlterField(
            model_name="address",
            name="is_default",
            field=models.BooleanField(
                default=False, help_text="Whether this is the default address"
            ),
        ),
    ]
