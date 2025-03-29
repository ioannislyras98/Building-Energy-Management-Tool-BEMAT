from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("uuid", "name", "cost_per_kwh_fuel", "cost_per_kwh_electricity", "user")