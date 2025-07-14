from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("profile", "0006_profile_role"),
    ]

    operations = [
        migrations.DeleteModel(
            name="RoleAssignment",
        ),
    ]
