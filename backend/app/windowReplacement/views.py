from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
import json
import logging

from .models import WindowReplacement
from .serializer import (
    WindowReplacementSerializer,
    WindowReplacementListSerializer
)
from building.models import Building
from project.models import Project
from common.utils import is_admin_user, has_access_permission

logger = logging.getLogger(__name__)


class WindowReplacementListView(generics.ListAPIView):
    serializer_class = WindowReplacementListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WindowReplacement.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            "success": True,
            "data": serializer.data,
            "count": len(serializer.data)
        })


class WindowReplacementByBuildingView(generics.ListAPIView):
    serializer_class = WindowReplacementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        building_uuid = self.kwargs['building_uuid']
        return WindowReplacement.objects.filter(
            building__uuid=building_uuid,
            user=self.request.user
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            "success": True,
            "data": serializer.data,
            "count": len(serializer.data)
        })


class WindowReplacementCreateView(generics.CreateAPIView):
    serializer_class = WindowReplacementSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                window_replacement = serializer.save()
                response_serializer = WindowReplacementSerializer(window_replacement)
                
                return Response({
                    "success": True,
                    "message": "Window replacement data created successfully",
                    "data": response_serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "success": False,
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "success": False,
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WindowReplacementDetailView(generics.RetrieveAPIView):
    serializer_class = WindowReplacementSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        return WindowReplacement.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            "success": True,
            "data": serializer.data
        })


class WindowReplacementUpdateView(generics.UpdateAPIView):
    serializer_class = WindowReplacementSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        return WindowReplacement.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
            
            if serializer.is_valid():
                window_replacement = serializer.save()
                response_serializer = WindowReplacementSerializer(window_replacement)
                
                return Response({
                    "success": True,
                    "message": "Window replacement data updated successfully",
                    "data": response_serializer.data
                })
            else:
                return Response({
                    "success": False,
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "success": False,
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WindowReplacementDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        return WindowReplacement.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            
            return Response({
                "success": True,
                "message": "Window replacement data deleted successfully"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "success": False,
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_window_replacement_summary(request, building_uuid):
    """Get summary of all window replacements for a building"""
    try:
        window_replacements = WindowReplacement.objects.filter(
            building__uuid=building_uuid,
            user=request.user
        )
        
        if not window_replacements.exists():
            return Response({
                "success": True,
                "data": {
                    "count": 0,
                    "total_investment": 0,
                    "total_annual_savings": 0,
                    "average_payback_period": 0,
                    "total_energy_savings": 0
                }
            })
        
        total_investment = sum(wr.total_investment_cost or 0 for wr in window_replacements)
        total_annual_savings = sum(wr.annual_cost_savings or 0 for wr in window_replacements)
        total_energy_savings = sum(wr.total_energy_savings or 0 for wr in window_replacements)
        
        payback_periods = [wr.payback_period for wr in window_replacements if wr.payback_period]
        average_payback_period = sum(payback_periods) / len(payback_periods) if payback_periods else 0
        
        return Response({
            "success": True,
            "data": {
                "count": window_replacements.count(),
                "total_investment": total_investment,
                "total_annual_savings": total_annual_savings,
                "average_payback_period": average_payback_period,
                "total_energy_savings": total_energy_savings
            }
        })
        
    except Exception as e:
        return Response({
            "success": False,
            "detail": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
