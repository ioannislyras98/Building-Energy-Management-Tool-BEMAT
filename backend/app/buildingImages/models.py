import uuid
from django.db import models
from django.core.validators import FileExtensionValidator
from django.conf import settings
from building.models import Building
from project.models import Project
import base64


class BuildingImage(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    CATEGORY_CHOICES = [
        ('exterior', 'Exterior Views'),
        ('interior', 'Interior Views'),
        ('systems', 'Building Systems'),
        ('construction', 'Construction Details'),
        ('documentation', 'Documentation'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    tags = models.CharField(max_length=500, blank=True, null=True, help_text="Comma-separated tags")
    
    # Store image as binary data in database
    image_data = models.BinaryField(
        help_text="Image binary data. Maximum file size: 10MB. Allowed formats: JPG, JPEG, PNG, GIF",
        default=b''
    )
    image_name = models.CharField(max_length=255, help_text="Original filename", default='')
    image_type = models.CharField(max_length=50, help_text="Image MIME type (e.g., image/jpeg)", default='image/jpeg')
    image_size = models.PositiveIntegerField(help_text="Image file size in bytes", default=0)
    
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='images')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='building_images')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='building_images', null=True, blank=True)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Building Image"
        verbose_name_plural = "Building Images"
    
    def __str__(self):
        return f"{self.title} - {self.building.name}"

    def clean(self):
        """Custom validation for file size"""
        from django.core.exceptions import ValidationError
        if self.image_data:
            # Check file size (10MB = 10 * 1024 * 1024 bytes)
            if len(self.image_data) > 10 * 1024 * 1024:
                raise ValidationError("File size cannot exceed 10MB.")

    def get_image_data_url(self):
        """Return data URL for the image"""
        if self.image_data:
            encoded = base64.b64encode(self.image_data).decode('utf-8')
            return f"data:{self.image_type};base64,{encoded}"
        return None

    @property
    def image_url(self):
        """Property to maintain compatibility with frontend"""
        return self.get_image_data_url()
