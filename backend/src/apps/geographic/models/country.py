from django.db import models
from typing import TYPE_CHECKING

from apps.common.models import TimestampedModel

if TYPE_CHECKING:
    from django.db.models.query import QuerySet


class Country(TimestampedModel):
    code = models.CharField(
        max_length=2,
        unique=True,
        db_index=True,
        help_text="alpha-2 country code (e.g., PL, US, GB)",
    )
    name = models.CharField(
        max_length=100,
        help_text="Official country name in English",
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Country"
        verbose_name_plural = "Countries"
        indexes = [
            models.Index(fields=["code"]),
            models.Index(fields=["name"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"

    def clean(self) -> None:
        super().clean()
        if self.code:
            self.code = self.code.upper().strip()
        if self.name:
            self.name = self.name.strip()

    def save(self, *args, **kwargs) -> None:
        self.full_clean()
        super().save(*args, **kwargs)

    @classmethod
    def get_by_code(cls, code: str) -> "Country | None":
        try:
            return cls.objects.get(code__iexact=code.strip())
        except cls.DoesNotExist:
            return None

    @classmethod
    def get_countries(cls) -> "QuerySet[Country]":
        return cls.objects.all().order_by("name")
