from django.apps import AppConfig


class ProfileConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.profile"

    def ready(self):
        # Import signals to register post_save handlers (e.g., auto-create Profile)
        import apps.profile.signals  # noqa: F401
