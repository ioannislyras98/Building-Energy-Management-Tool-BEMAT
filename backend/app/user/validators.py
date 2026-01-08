from django.contrib.auth.password_validation import (
    UserAttributeSimilarityValidator,
    MinimumLengthValidator,
    CommonPasswordValidator,
    NumericPasswordValidator,
)
from django.core.exceptions import ValidationError as DjangoValidationError

# Password error message translations
PASSWORD_ERROR_TRANSLATIONS = {
    'en': {
        'too_short': 'This password is too short. It must contain at least 8 characters.',
        'too_common': 'This password is too common.',
        'entirely_numeric': 'This password is entirely numeric.',
        'too_similar': 'The password is too similar to your personal information.',
    },
    'gr': {
        'too_short': 'Ο κωδικός είναι πολύ σύντομος. Πρέπει να έχει τουλάχιστον 8 χαρακτήρες.',
        'too_common': 'Αυτός ο κωδικός είναι πολύ συνηθισμένος.',
        'entirely_numeric': 'Ο κωδικός περιέχει μόνο αριθμούς.',
        'too_similar': 'Ο κωδικός είναι πολύ παρόμοιος με τα προσωπικά σας στοιχεία.',
    }
}


def translate_password_error(error_message, language='en'):
    """Translate password validation error messages"""
    translations = PASSWORD_ERROR_TRANSLATIONS.get(language, PASSWORD_ERROR_TRANSLATIONS['en'])
    
    # Map Django error messages to translation keys
    if 'too short' in error_message.lower():
        return translations['too_short']
    elif 'too common' in error_message.lower():
        return translations['too_common']
    elif 'entirely numeric' in error_message.lower():
        return translations['entirely_numeric']
    elif 'too similar' in error_message.lower():
        return translations['too_similar']
    
    return error_message


def validate_password_with_translation(password, user=None, language='en'):
    """
    Validate password using Django validators and return translated error messages
    """
    validators = [
        UserAttributeSimilarityValidator(),
        MinimumLengthValidator(),
        CommonPasswordValidator(),
        NumericPasswordValidator(),
    ]
    
    errors = []
    for validator in validators:
        try:
            validator.validate(password, user=user)
        except DjangoValidationError as e:
            # Handle both single message and list of messages
            error_messages = e.messages if hasattr(e, 'messages') else [str(e)]
            for error_msg in error_messages:
                translated_error = translate_password_error(str(error_msg), language)
                errors.append(translated_error)
    
    if errors:
        raise DjangoValidationError(errors)
