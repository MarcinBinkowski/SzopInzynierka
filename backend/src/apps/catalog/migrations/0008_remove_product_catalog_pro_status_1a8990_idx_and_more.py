from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0007_alter_productimage_image"),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name="product",
            name="catalog_pro_status_1a8990_idx",
        ),
        migrations.RemoveIndex(
            model_name="product",
            name="catalog_pro_categor_da0f0a_idx",
        ),
        migrations.RemoveField(
            model_name="product",
            name="status",
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(
                fields=["is_visible"], name="catalog_pro_is_visi_a4359a_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(
                fields=["category", "is_visible"], name="catalog_pro_categor_0cca88_idx"
            ),
        ),
    ]
