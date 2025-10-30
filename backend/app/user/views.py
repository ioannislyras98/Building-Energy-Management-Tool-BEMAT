from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer
from .serializers import ChangePasswordSerializer
from .serializers import UpdateProfileSerializer
from .serializers import PasswordResetRequestSerializer
from .serializers import PasswordResetConfirmSerializer
from .serializers import CustomAuthTokenSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import api_view, permission_classes
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class CustomAuthToken(ObtainAuthToken):
    serializer_class = CustomAuthTokenSerializer

    def post(self, request, *args, **kwargs):
        logger.info("Login attempt received")
        logger.debug(f"Login attempt for email: {request.data.get('email', 'N/A')}")
        
        serializer = self.serializer_class(data=request.data,
                                             context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            logger.info(f"User authenticated successfully: {user.email}")
            
            token, created = Token.objects.get_or_create(user=user)
            if created:
                logger.info(f"New token created for user: {user.email}")
            else:
                logger.debug(f"Existing token retrieved for user: {user.email}")
            
            return Response({
                'token': token.key,
            })
        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            raise
    
class SignUpView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        logger.info("User registration attempt received")
        logger.debug(f"Registration data: email={request.data.get('email', 'N/A')}, first_name={request.data.get('first_name', 'N/A')}, last_name={request.data.get('last_name', 'N/A')}")
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            logger.info(f"User created successfully: {user.email}")
            logger.debug(f"User UUID: {user.uuid}")
            
            token = Token.objects.create(user=user)
            logger.info(f"Authentication token created for new user: {user.email}")
            
            return Response({
                'token': token.key,
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"User registration failed: {str(e)}")
            raise

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        logger.info(f"Password change request for user: {request.user.email}")
        language = request.headers.get('X-Language', 'en')
        
        try:
            serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            logger.info(f"Password changed successfully for user: {request.user.email}")
            
            if language == 'gr':
                return Response({"detail": "Το password άλλαξε επιτυχώς."}, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Password change failed for user {request.user.email}: {str(e)}")
            raise

class PasswordResetRequestView(APIView):
    permission_classes = [] 
    def post(self, request, *args, **kwargs):
        logger.info("Password reset request received")
        logger.debug(f"Password reset requested for email: {request.data.get('email', 'N/A')}")
        
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Password reset email sent to: {request.data.get('email')}")
            return Response({"detail": "Έχει σταλεί email επαναφοράς κωδικού."}, status=status.HTTP_200_OK)
        
        logger.warning(f"Password reset request failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = []
    def post(self, request, uid, token, *args, **kwargs):
        logger.info("Password reset confirmation received")
        logger.debug(f"Reset confirmation - UID: {uid}")
        
        data = request.data.copy()
        data['uid'] = uid
        data['token'] = token
        serializer = PasswordResetConfirmSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Password reset confirmed successfully for UID: {uid}")
            return Response({"detail": "Ο κωδικός έχει αλλάξει επιτυχώς."}, status=status.HTTP_200_OK)
        
        logger.warning(f"Password reset confirmation failed for UID {uid}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            logger.debug(f"Current user info requested by: {request.user.email}")
            user = request.user
            data = {
                'uuid': str(user.uuid) if hasattr(user, 'uuid') else user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_superuser': user.is_superuser,
                'is_staff': user.is_staff,
                'is_active': user.is_active
            }
            logger.info(f"Current user info retrieved successfully for: {user.email}")
            return Response({'data': data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving current user info: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        try:
            logger.info(f"Profile update request for user: {request.user.email}")
            logger.debug(f"Profile update data: {request.data}")
            
            language = request.headers.get('X-Language', 'en')
            serializer = UpdateProfileSerializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Profile updated successfully for user: {request.user.email}")
                if language == 'gr':
                    return Response({"message": "Το προφίλ ενημερώθηκε επιτυχώς."}, status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Profile update validation failed for user {request.user.email}: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error updating profile for user {request.user.email}: {str(e)}", exc_info=True)
            language = request.headers.get('X-Language', 'en')
            if language == 'gr':
                return Response(
                    {"error": "Σφάλμα κατά την ενημέρωση του προφίλ."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            else:
                return Response(
                    {"error": "Error updating profile."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
