from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import NumericValue
from .serializer import NumericValueSerializer


class NumericValueListView(generics.ListAPIView):
    """
    API view για την προβολή όλων των αριθμητικών τιμών
    """
    queryset = NumericValue.objects.all().order_by('name')
    serializer_class = NumericValueSerializer
    permission_classes = [AllowAny]  # Temporarily remove auth for testing


class NumericValueUpdateView(generics.UpdateAPIView):
    """
    API view για την ενημέρωση μόνο του πεδίου value
    Δεν επιτρέπεται η αλλαγή του name
    """
    queryset = NumericValue.objects.all()
    serializer_class = NumericValueSerializer
    permission_classes = [AllowAny]  # Temporarily remove auth for testing
    lookup_field = 'uuid'
    
    def patch(self, request, *args, **kwargs):
        """
        Επιτρέπει μόνο την αλλαγή του value
        """
        if 'name' in request.data:
            return Response(
                {"error": "Δεν επιτρέπεται η αλλαγή του ονόματος"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().patch(request, *args, **kwargs)
    
    def put(self, request, *args, **kwargs):
        """
        Επιτρέπει μόνο την αλλαγή του value
        """
        if 'name' in request.data:
            return Response(
                {"error": "Δεν επιτρέπεται η αλλαγή του ονόματος"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().put(request, *args, **kwargs)
