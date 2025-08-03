from rest_framework import serializers
from .models import BuildingActivity
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """Simple user serializer for activity display"""
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['uuid', 'email', 'first_name', 'last_name', 'display_name']
        
    def get_display_name(self, obj):
        """Get user's display name"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        elif obj.first_name:
            return obj.first_name
        elif obj.last_name:
            return obj.last_name
        else:
            return obj.email


class BuildingActivitySerializer(serializers.ModelSerializer):
    """Serializer for BuildingActivity model"""
    user = UserSimpleSerializer(read_only=True)
    user_display_name = serializers.CharField(read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    icon = serializers.CharField(source='get_icon', read_only=True)
    color_class = serializers.CharField(source='get_color_class', read_only=True)
    
    # Time formatting
    created_at_formatted = serializers.SerializerMethodField()
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = BuildingActivity
        fields = [
            'id', 'building', 'project', 'user', 'user_display_name',
            'action_type', 'action_type_display', 'title', 'description',
            'content_type', 'object_id', 'extra_data',
            'icon', 'color_class',
            'created_at', 'created_at_formatted', 'time_since', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_created_at_formatted(self, obj):
        """Format the created_at datetime for display"""
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
    
    def get_time_since(self, obj):
        """Get human readable time since creation"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} μέρες πριν"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} ώρες πριν"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} λεπτά πριν"
        else:
            return "Μόλις τώρα"


class BuildingActivityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating BuildingActivity instances"""
    
    # Accept UUIDs for building and project
    building = serializers.CharField(write_only=True)
    project = serializers.CharField(write_only=True)
    
    class Meta:
        model = BuildingActivity
        fields = [
            'building', 'project', 'action_type', 'title', 'description',
            'content_type', 'object_id', 'extra_data'
        ]
    
    def create(self, validated_data):
        from building.models import Building
        from project.models import Project
        from django.shortcuts import get_object_or_404
        
        # Convert UUIDs to objects
        building_uuid = validated_data.pop('building')
        project_uuid = validated_data.pop('project')
        
        building = get_object_or_404(Building, uuid=building_uuid)
        project = get_object_or_404(Project, uuid=project_uuid)
        
        validated_data['building'] = building
        validated_data['project'] = project
        
        # Add user from request context
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
            
            # Add request metadata
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
            validated_data['session_key'] = request.session.session_key
        
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
