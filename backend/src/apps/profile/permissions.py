from typing import Union

from django.contrib.auth.models import AnonymousUser, AbstractBaseUser
from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.profile.models.profile import Profile


def get_user_role(user: Union[AbstractBaseUser, AnonymousUser] | None) -> int:
    """Return numeric role level for the given user.
    1=ADMIN,2=EMPLOYEE,3=USER.
    """
    if not user or isinstance(user, AnonymousUser) or not hasattr(user, "profile"):
        return Profile.Role.USER
    return getattr(user.profile, "role", Profile.Role.USER)


class RolesAllowed(BasePermission):
    """Allow only users whose role is within the allowed set.

    Usage: RolesAllowed(allowed_roles={Profile.Role.ADMIN, Profile.Role.EMPLOYEE})
    """

    message = "You do not have permission to perform this action."

    def __init__(self, allowed_roles: set[int]) -> None:
        super().__init__()
        self.allowed_roles = allowed_roles

    def has_permission(self, request, view) -> bool:
        return get_user_role(request.user) in self.allowed_roles


class ReadOnlyOrRoles(BasePermission):
    """Allow read-only for authenticated users; writes only for allowed roles."""

    message = "You do not have permission to perform this action."

    def __init__(self, allowed_roles: set[int]) -> None:
        super().__init__()
        self.allowed_roles = allowed_roles

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return get_user_role(request.user) in self.allowed_roles
