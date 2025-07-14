from django.apps import AppConfig


class CheckoutConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.checkout"

    def ready(self):
        """Import signals when the app is ready."""
        import apps.checkout.signals  # noqa
