# users/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that uses email instead of username
    """
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field] = serializers.EmailField()
        self.fields['password'] = serializers.CharField()

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['name'] = user.name
        token['user_type'] = user.user_type
        
        return token

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                              email=email, password=password)
            
            if not user:
                raise serializers.ValidationError(
                    'No active account found with the given credentials'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.'
                )

        else:
            raise serializers.ValidationError(
                'Must include "email" and "password".'
            )

        refresh = self.get_token(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'user_type': user.user_type,
            }
        }


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'},
        help_text="Password must be at least 8 characters long"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Enter the same password as before, for verification"
    )

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'user_type', 'password_confirm')
        extra_kwargs = {
            'email': {
                'help_text': 'Enter a valid email address',
                'error_messages': {
                    'unique': 'A user with this email already exists.',
                }
            },
            'name': {
                'help_text': 'Enter your full name',
                'max_length': 255
            },
            'user_type': {
                'help_text': 'Select user type',
                'default': 'CUSTOMER'
            }
        }

    def validate_email(self, value):
        """
        Check that the email is not already in use
        """
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_password(self, value):
        """
        Validate password strength
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        # Check for at least one letter and one number
        if not any(c.isalpha() for c in value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError("Password must contain at least one number.")
        
        return value

    def validate(self, attrs):
        """
        Check that the two password entries match
        """
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if password and password_confirm and password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': "The two password fields didn't match."
            })
        
        return attrs

    def create(self, validated_data):
        """
        Create and return a new user instance with encrypted password
        """
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create user with the custom manager which handles password hashing
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user details
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'user_type', 'is_active', 'date_joined')
        read_only_fields = ('id', 'date_joined')
