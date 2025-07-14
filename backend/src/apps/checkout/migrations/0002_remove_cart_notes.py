from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("checkout", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="cart",
            name="notes",
        ),
    ]
