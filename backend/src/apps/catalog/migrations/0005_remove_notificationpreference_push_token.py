from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0004_notificationpreference_notificationhistory"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="notificationpreference",
            name="push_token",
        ),
    ]
