from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer
from .serializers import ChangePasswordSerializer
from .serializers import PasswordResetRequestSerializer
from .serializers import PasswordResetConfirmSerializer


User = get_user_model()

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
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Το password άλλαξε επιτυχώς."}, status=status.HTTP_200_OK)

class PasswordResetRequestView(APIView):
    permission_classes = []  # Δεν απαιτείται αυθεντικοποίηση
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Έχει σταλεί email επαναφοράς κωδικού."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = []  # Δεν απαιτείται αυθεντικοποίηση
    def post(self, request, uid, token, *args, **kwargs):
        data = request.data.copy()
        data['uid'] = uid
        data['token'] = token
        serializer = PasswordResetConfirmSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Ο κωδικός έχει αλλάξει επιτυχώς."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
