"""
Common utilities and helpers for the backend application.
"""

from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import uuid


def get_user_from_token(token_key):
    """
    Helper function to get user from token key.
    Used for backward compatibility with csrf_exempt views.
    """
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return None


def standard_error_response(message, status_code=400):
    """
    Standard error response format.
    """
    return {
        'status': 'error',
        'message': message
    }, status_code


def standard_success_response(data, message=None, status_code=200):
    """
    Standard success response format.
    """
    response = {
        'status': 'success',
        'data': data
    }
    if message:
        response['message'] = message
    return response, status_code


def validate_uuid(uuid_string):
    """
    Validate and convert string to UUID.
    """
    try:
        return uuid.UUID(uuid_string)
    except (ValueError, AttributeError):
        return None


def check_user_ownership(obj, user, error_message=None):
    """
    Check if user owns the object.
    """
    if not error_message:
        error_message = "You don't have permission to access this resource"
    
    if hasattr(obj, 'user') and obj.user != user:
        return False, error_message
    elif hasattr(obj, 'project') and hasattr(obj.project, 'user') and obj.project.user != user:
        return False, error_message
    
    return True, None
