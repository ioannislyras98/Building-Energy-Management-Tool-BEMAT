from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        logger.debug(f"Authentication attempt for email: {username}")
        
        if username is None or password is None:
            logger.warning("Authentication failed: Missing username or password")
            return None
        
        try:
            user = User.objects.get(email=username)
            logger.debug(f"User found in database: {username}")
        except User.DoesNotExist:
            logger.warning(f"Authentication failed: User not found with email {username}")
            return None
        
        if user.check_password(password):
            logger.debug(f"Password check passed for user: {username}")
            if self.user_can_authenticate(user):
                logger.info(f"Authentication successful for user: {username}")
                return user
            else:
                logger.warning(f"Authentication failed: User {username} cannot authenticate (inactive or disabled)")
        else:
            logger.warning(f"Authentication failed: Invalid password for user {username}")
        
        return None

    def user_can_authenticate(self, user):
        is_active = getattr(user, 'is_active', None)
        return is_active or is_active is None

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None
