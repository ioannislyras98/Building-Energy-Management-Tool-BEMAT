from rest_framework import serializers
from .models import User
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.utils.translation import gettext_lazy as _
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True, allow_blank=False)
    last_name = serializers.CharField(required=True, allow_blank=False)
    
    class Meta:
        model = User
        fields = ('uuid', 'email', 'password', 'first_name', 'last_name', 'date_joined')
        extra_kwargs = {
            'date_joined': {'read_only': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UpdateProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True, allow_blank=False, max_length=30)
    last_name = serializers.CharField(required=True, allow_blank=False, max_length=150)
    email = serializers.EmailField(required=True)
    current_password = serializers.CharField(required=True, write_only=True)
    
    def validate_current_password(self, value):
        if not self.context['request'].user.check_password(value):
            language = self.context['request'].headers.get('X-Language', 'en')
            if language == 'gr':
                raise serializers.ValidationError("Λάθος κωδικός")
            else:
                raise serializers.ValidationError("Invalid password")
        return value
    
    def validate_first_name(self, value):
        if not value or not value.strip():
            language = self.context['request'].headers.get('X-Language', 'en')
            if language == 'gr':
                raise serializers.ValidationError("Το όνομα είναι υποχρεωτικό")
            else:
                raise serializers.ValidationError("First name is required")
        return value
    
    def validate_last_name(self, value):
        if not value or not value.strip():
            language = self.context['request'].headers.get('X-Language', 'en')
            if language == 'gr':
                raise serializers.ValidationError("Το επώνυμο είναι υποχρεωτικό")
            else:
                raise serializers.ValidationError("Last name is required")
        return value

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(uuid=user.uuid).exists():
            language = self.context['request'].headers.get('X-Language', 'en')
            if language == 'gr':
                raise serializers.ValidationError("Αυτό το email χρησιμοποιείται ήδη")
            else:
                raise serializers.ValidationError("This email is already in use")
        return value
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.first_name = self.validated_data['first_name']
        user.last_name = self.validated_data['last_name']
        user.email = self.validated_data['email']
        user.save()
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        if not self.context['request'].user.check_password(value):
            language = self.context['request'].headers.get('X-Language', 'en')
            if language == 'gr':
                raise serializers.ValidationError("Λάθος κωδικός")
            else:
                raise serializers.ValidationError("Invalid password")
        return value

    def validate(self, data):
        request = self.context['request']
        language = request.headers.get('X-Language', 'en')
        
        if data['new_password'] != data['new_password_confirm']:
            if language == 'gr':
                raise serializers.ValidationError("Τα νέα passwords δεν ταιριάζουν.")
            else:
                raise serializers.ValidationError("New passwords don't match.")
        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Δεν υπάρχει χρήστης με αυτό το email.")
        return value

    def save(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"http://localhost:3000/reset-password-confirm/{uid}/{token}/"
        subject = "Επαναφορά κωδικού πρόσβασης"
        message = f"Παρακαλώ κάνε κλικ στον παρακάτω σύνδεσμο για να επαναφέρεις τον κωδικό σου:\n\n{reset_url}"
        send_mail(subject, message, None, [email], fail_silently=False)

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Οι νέοι κωδικοί δεν ταιριάζουν.")
        return data

    def save(self, **kwargs):
        uid = self.validated_data['uid']
        token = self.validated_data['token']
        new_password = self.validated_data['new_password']
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Μη έγκυρο αναγνωριστικό χρήστη.")
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError("Μη έγκυρο ή ληγμένο token.")
        user.set_password(new_password)
        user.save()
        return user

class CustomAuthTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(label="Email")
    password = serializers.CharField(
        label="Κωδικός",
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                                username=email, password=password)
            if not user:
                msg = _('Αδύνατη η σύνδεση με τα δοθέντα διαπιστευτήρια.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('Πρέπει να συμπληρώσετε email και κωδικό.')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs
