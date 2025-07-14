from django.http import HttpRequest, HttpResponse, JsonResponse
from django.contrib.auth import authenticate
from apps.profile.models import Profile
import json


def _json_or_empty(request: HttpRequest) -> dict:
    """Parse JSON request body, return empty dict if invalid."""
    try:
        return json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError, AttributeError):
        return {}


def _forbidden_response() -> JsonResponse:
    """Return 403 Forbidden response for role-based dashboard access denial."""
    return JsonResponse(
        {
            "status": 403,
            "errors": [
                {
                    "message": "Access denied. Users cannot access the dashboard.",
                    "code": "insufficient_permissions",
                    "param": "client",
                }
            ],
        },
        status=403,
    )


class TimeDelayMiddleware(object):
    """Middleware that introduces a delay for each request. Used for testing"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # time.sleep(2)  # Delay in seconds
        response = self.get_response(request)
        return response


class BrowserLoginRoleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        if (
            request.method == "POST"
            and request.path == "/_allauth/browser/v1/auth/login"
        ):
            body = _json_or_empty(request)
            if body.get("client") == "browser":
                email = (body.get("email") or "").strip().lower()
                password = body.get("password")
                if email and password:
                    user = authenticate(request, username=email, password=password)
                    if user and getattr(user, "is_authenticated", False):
                        try:
                            role = user.profile.role
                        except Profile.DoesNotExist:
                            role = Profile.Role.USER

                        if role in {Profile.Role.USER}:
                            return _forbidden_response()

        return self.get_response(request)
