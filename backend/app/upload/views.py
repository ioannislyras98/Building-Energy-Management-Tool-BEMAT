from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
import logging

logger = logging.getLogger(__name__)


def image_upload(request):
    if request.method == "POST" and request.FILES["image_file"]:
        logger.info("Image upload request received")
        image_file = request.FILES["image_file"]
        logger.debug(f"Image file: {image_file.name}, size: {image_file.size} bytes")
        
        fs = FileSystemStorage()
        filename = fs.save(image_file.name, image_file)
        image_url = fs.url(filename)
        logger.info(f"Image uploaded successfully: {image_url}")
        
        return render(request, "upload.html", {
            "image_url": image_url
        })
    return render(request, "upload.html")
