from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.profile.models import Profile
from apps.catalog.models.notification import NotificationPreference


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created: bool, **kwargs) -> None:
    """Create a Profile instance when a new User is created."""
    if created:
        Profile.objects.create(user=instance)
        NotificationPreference.objects.create(
            user=instance,
            stock_alerts_enabled=False,
            price_drop_alerts_enabled=False,
        )
