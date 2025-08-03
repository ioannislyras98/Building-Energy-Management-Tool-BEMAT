from django.db import models
from django.conf import settings
from building.models import Building
from project.models import Project
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import uuid


class BuildingActivity(models.Model):
    """
    Tracks all activities/changes that happen in a building
    """
    ACTION_TYPES = [
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('contact', 'Contact Added/Updated'),
        ('image', 'Image Added/Updated'),
        ('system', 'System Added/Updated'),
        ('material', 'Material Added/Updated'),
        ('energy', 'Energy Data Added/Updated'),
        ('calculation', 'Calculation Performed'),
        ('export', 'Data Exported'),
        ('import', 'Data Imported'),
        ('other', 'Other Activity'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='activities')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='building_activities')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    title = models.CharField(max_length=200, help_text="Short description of the activity")
    description = models.TextField(blank=True, null=True, help_text="Detailed description of what happened")
    
    # Generic relation to link to any model that was affected
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=100, null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Additional metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    session_key = models.CharField(max_length=100, blank=True, null=True)
    
    # Extra data as JSON for flexible storage
    extra_data = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Building Activity"
        verbose_name_plural = "Building Activities"
        indexes = [
            models.Index(fields=['building', '-created_at']),
            models.Index(fields=['project', '-created_at']),
            models.Index(fields=['action_type', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.building.name} - {self.get_action_type_display()}: {self.title}"
    
    @property
    def user_display_name(self):
        """Return user's display name or 'Anonymous User'"""
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
        return "Anonymous User"
    
    def get_icon(self):
        """Return appropriate icon for the activity type"""
        icon_map = {
            'create': 'plus-circle',
            'update': 'edit',
            'delete': 'trash',
            'contact': 'user',
            'image': 'image',
            'system': 'settings',
            'material': 'layers',
            'energy': 'zap',
            'calculation': 'calculator',
            'export': 'download',
            'import': 'upload',
            'other': 'activity',
        }
        return icon_map.get(self.action_type, 'activity')
    
    def get_color_class(self):
        """Return CSS color class for the activity type"""
        color_map = {
            'create': 'text-green-600',
            'update': 'text-blue-600',
            'delete': 'text-red-600',
            'contact': 'text-purple-600',
            'image': 'text-pink-600',
            'system': 'text-indigo-600',
            'material': 'text-yellow-600',
            'energy': 'text-orange-600',
            'calculation': 'text-teal-600',
            'export': 'text-gray-600',
            'import': 'text-cyan-600',
            'other': 'text-gray-500',
        }
        return color_map.get(self.action_type, 'text-gray-500')


def log_building_activity(building, project, user, action_type, title, description=None, 
                         content_object=None, extra_data=None, request=None):
    """
    Helper function to easily log building activities
    """
    activity_data = {
        'building': building,
        'project': project,
        'user': user,
        'action_type': action_type,
        'title': title,
        'description': description,
        'extra_data': extra_data or {},
    }
    
    if content_object:
        activity_data['content_object'] = content_object
    
    if request:
        activity_data['ip_address'] = get_client_ip(request)
        activity_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        activity_data['session_key'] = request.session.session_key
    
    return BuildingActivity.objects.create(**activity_data)


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
