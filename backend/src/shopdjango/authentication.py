from django.contrib.auth import get_user_model
from django.contrib.sessions.models import Session
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()


class AllAuthSessionAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class that handles AllAuth session tokens.
    This allows mobile apps to authenticate using X-Session-Token header.
    """

    def authenticate(self, request):
        session_token = request.META.get("HTTP_X_SESSION_TOKEN")

        if not session_token:
            return None

        try:
            session = Session.objects.get(session_key=session_token)
            user_id = session.get_decoded().get("_auth_user_id")

            if not user_id:
                return None

            user = User.objects.get(id=user_id)

            return (user, session_token)

        except (Session.DoesNotExist, User.DoesNotExist):
            return None
        except Exception as e:
            raise AuthenticationFailed(f"Session authentication failed: {str(e)}")

    def authenticate_header(self, request):
        return "Session token"
