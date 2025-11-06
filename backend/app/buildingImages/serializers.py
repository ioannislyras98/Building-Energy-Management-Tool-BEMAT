from rest_framework import serializers
from .models import BuildingImage
import base64
import uuid
from django.core.files.base import ContentFile


class BuildingImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = BuildingImage
        fields = [
            'id',
            'title',
            'description',
            'category',
            'tags',
            'image',
            'image_name',
            'image_type',
            'image_size',
            'building',
            'project',
            'uploaded_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'uploaded_at', 'updated_at', 'image_name', 'image_type', 'image_size']

    def get_image(self, obj):
        """Return data URL for the image"""
        return obj.get_image_data_url()


class BuildingImageCreateUpdateSerializer(serializers.ModelSerializer):
    image = serializers.CharField(write_only=True, help_text="Base64 encoded image data")
    
    class Meta:
        model = BuildingImage
        fields = [
            'id',
            'title',
            'description',
            'category',
            'tags',
            'image',
            'building',
            'project',
            'uploaded_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'uploaded_at', 'updated_at']

    def validate_image(self, value):
        """Validate base64 image data"""
        try:
            if value.startswith('data:'):
                header, data = value.split(',', 1)
                image_type = header.split(':')[1].split(';')[0]
            else:
                data = value
                image_type = 'image/jpeg' 
            
            image_data = base64.b64decode(data)
            
            # Check file size (10MB = 10 * 1024 * 1024 bytes)
            if len(image_data) > 10 * 1024 * 1024:
                raise serializers.ValidationError("File size cannot exceed 10MB.")
            
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if image_type not in allowed_types:
                raise serializers.ValidationError(
                    f"Image type '{image_type}' is not allowed. "
                    f"Allowed types: {', '.join(allowed_types)}"
                )
            
            return {
                'data': image_data,
                'type': image_type,
                'size': len(image_data)
            }
            
        except Exception as e:
            raise serializers.ValidationError(f"Invalid image data: {str(e)}")

    def create(self, validated_data):
        image_info = validated_data.pop('image')
        
        # Get user from context (set by the view)
        user = self.context['request'].user
        
        instance = BuildingImage.objects.create(
            image_data=image_info['data'],
            image_type=image_info['type'],
            image_size=image_info['size'],
            image_name=f"{validated_data.get('title', 'image')}_{uuid.uuid4().hex[:8]}.{image_info['type'].split('/')[1]}",
            user=user,
            **validated_data
        )
        
        return instance

    def update(self, instance, validated_data):
        if 'image' in validated_data:
            image_info = validated_data.pop('image')
            instance.image_data = image_info['data']
            instance.image_type = image_info['type']
            instance.image_size = image_info['size']
            instance.image_name = f"{validated_data.get('title', instance.title)}_{uuid.uuid4().hex[:8]}.{image_info['type'].split('/')[1]}"
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class BuildingImageListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = BuildingImage
        fields = [
            'id',
            'title',
            'category',
            'image',
            'uploaded_at'
        ]

    def get_image(self, obj):
        """Return data URL for the image"""
        return obj.get_image_data_url()
