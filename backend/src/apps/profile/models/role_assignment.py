from django.db import models
from django.contrib.auth import get_user_model
from apps.common.models import TimestampedModel

User = get_user_model()


class RoleAssignment(TimestampedModel):
    """User role assignments for access control."""
    
    class RoleType(models.TextChoices):
        ADMIN = "admin", "Admin"
        READER = "reader", "Reader"
        CUSTOMER = "customer", "Customer"
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='role_assignments',
        help_text="User assigned to this role"
    )
    role = models.CharField(
        max_length=20,
        choices=RoleType.choices,
        default=RoleType.CUSTOMER,
        help_text="Role assigned to the user"
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='role_assignments_given',
        help_text="User who assigned this role"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this role assignment is currently active"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Role Assignment"
        verbose_name_plural = "Role Assignments"
        unique_together = ['user', 'role']  # One user can only have one role
    
    def __str__(self) -> str:
        return f"{self.user.username} - {self.get_role_display()}"
    
    @property
    def is_admin(self) -> bool:
        """Check if user has admin role."""
        return self.role == self.RoleType.ADMIN
    
    @property
    def is_reader(self) -> bool:
        """Check if user has reader role."""
        return self.role == self.RoleType.READER
    
    @property
    def is_customer(self) -> bool:
        """Check if user has customer role."""
        return self.role == self.RoleType.CUSTOMER 