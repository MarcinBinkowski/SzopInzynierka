from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("profile", "0005_roleassignment"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="role",
            field=models.IntegerField(
                choices=[(1, "Admin"), (2, "Employee"), (3, "User")], default=3
            ),
        ),
    ]
