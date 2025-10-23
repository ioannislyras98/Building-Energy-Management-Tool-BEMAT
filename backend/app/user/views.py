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



User = get_user_model()

class CustomAuthToken(ObtainAuthToken):
    serializer_class = CustomAuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                             context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
        })
    
class SignUpView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = Token.objects.create(user=user)
        return Response({
            'token': token.key,
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        language = request.headers.get('X-Language', 'en')
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        if language == 'gr':
            return Response({"detail": "Το password άλλαξε επιτυχώς."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)

class PasswordResetRequestView(APIView):
    permission_classes = [] 
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Έχει σταλεί email επαναφοράς κωδικού."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = []
    def post(self, request, uid, token, *args, **kwargs):
        data = request.data.copy()
        data['uid'] = uid
        data['token'] = token
        serializer = PasswordResetConfirmSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Ο κωδικός έχει αλλάξει επιτυχώς."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
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
            return Response({'data': data}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error in get_current_user: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        try:
            language = request.headers.get('X-Language', 'en')
            serializer = UpdateProfileSerializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                serializer.save()
                if language == 'gr':
                    return Response({"message": "Το προφίλ ενημερώθηκε επιτυχώς."}, status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
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
