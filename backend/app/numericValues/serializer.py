from rest_framework import serializers
from .models import NumericValue


class NumericValueSerializer(serializers.ModelSerializer):
    """
    Serializer για τη διαχείριση αριθμητικών τιμών
    Επιτρέπει μόνο την επεξεργασία του πεδίου value
    """
    created_by_username = serializers.SerializerMethodField()
    
    class Meta:
        model = NumericValue
        fields = ['uuid', 'name', 'value', 'created_by_username', 'created_at', 'updated_at']
        read_only_fields = ['uuid', 'name', 'created_by_username', 'created_at', 'updated_at']
    
    def get_created_by_username(self, obj):
        """
        Επιστρέφει το email του δημιουργού ή None αν δεν υπάρχει
        """
        if obj.created_by:
            return obj.created_by.email
        return None
    
    def validate_value(self, value):
        """
        Validate that value is a positive number
        """
        if value < 0:
            raise serializers.ValidationError("Η τιμή πρέπει να είναι θετική")
        return value
