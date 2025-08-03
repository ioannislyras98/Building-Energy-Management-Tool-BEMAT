"""
Activity logging utilities for automatic activity tracking
"""
from .models import log_building_activity
from django.contrib.contenttypes.models import ContentType


def log_contact_activity(building, project, user, action, contact, request=None):
    """Log contact-related activities"""
    action_map = {
        'create': 'Νέα επαφή προστέθηκε',
        'update': 'Στοιχεία επαφής ενημερώθηκαν', 
        'delete': 'Επαφή διαγράφηκε'
    }
    
    title = action_map.get(action, f'Ενέργεια επαφής: {action}')
    description = f'Επαφή: {contact.name} ({contact.role})'
    
    return log_building_activity(
        building=building,
        project=project,
        user=user,
        action_type='contact',
        title=title,
        description=description,
        content_object=contact,
        extra_data={
            'contact_name': contact.name,
            'contact_role': contact.role,
            'contact_email': contact.email,
            'action': action
        },
        request=request
    )


def log_image_activity(building, project, user, action, image, request=None):
    """Log image-related activities"""
    action_map = {
        'create': 'Νέα εικόνα προστέθηκε',
        'update': 'Εικόνα ενημερώθηκε',
        'delete': 'Εικόνα διαγράφηκε'
    }
    
    title = action_map.get(action, f'Ενέργεια εικόνας: {action}')
    description = f'Εικόνα: {image.title} (Κατηγορία: {image.get_category_display()})'
    
    return log_building_activity(
        building=building,
        project=project,
        user=user,
        action_type='image',
        title=title,
        description=description,
        content_object=image,
        extra_data={
            'image_title': image.title,
            'image_category': image.category,
            'image_size': getattr(image, 'image_size', 0),
            'action': action
        },
        request=request
    )


def log_system_activity(building, project, user, action, system_type, system_obj, request=None):
    """Log system-related activities (heating, cooling, etc.)"""
    action_map = {
        'create': f'Νέο {system_type} προστέθηκε',
        'update': f'{system_type} ενημερώθηκε',
        'delete': f'{system_type} διαγράφηκε'
    }
    
    title = action_map.get(action, f'Ενέργεια συστήματος: {action}')
    description = f'Σύστημα: {system_type}'
    
    # Try to get meaningful description from the system object
    if hasattr(system_obj, 'name'):
        description += f' - {system_obj.name}'
    elif hasattr(system_obj, 'type'):
        description += f' - {system_obj.type}'
    elif hasattr(system_obj, 'model'):
        description += f' - {system_obj.model}'
    
    return log_building_activity(
        building=building,
        project=project,
        user=user,
        action_type='system',
        title=title,
        description=description,
        content_object=system_obj,
        extra_data={
            'system_type': system_type,
            'action': action
        },
        request=request
    )


def log_energy_activity(building, project, user, action, energy_consumption, request=None):
    """Log energy consumption activities"""
    action_map = {
        'create': 'Νέα κατανάλωση ενέργειας προστέθηκε',
        'update': 'Κατανάλωση ενέργειας ενημερώθηκε',
        'delete': 'Κατανάλωση ενέργειας διαγράφηκε'
    }
    
    title = action_map.get(action, f'Ενέργεια κατανάλωσης: {action}')
    description = f'Πηγή: {energy_consumption.energy_source}, Ποσότητα: {energy_consumption.quantity} {energy_consumption.unit}'
    
    return log_building_activity(
        building=building,
        project=project,
        user=user,
        action_type='energy',
        title=title,
        description=description,
        content_object=energy_consumption,
        extra_data={
            'energy_source': energy_consumption.energy_source,
            'quantity': str(energy_consumption.quantity),
            'unit': energy_consumption.unit,
            'kwh_equivalent': str(getattr(energy_consumption, 'kwh_equivalent', 0)),
            'action': action
        },
        request=request
    )


def log_calculation_activity(building, project, user, calculation_type, results=None, request=None):
    """Log calculation activities"""
    title = f'Υπολογισμός {calculation_type} εκτελέστηκε'
    description = f'Τύπος υπολογισμού: {calculation_type}'
    
    extra_data = {
        'calculation_type': calculation_type,
        'action': 'calculate'
    }
    
    if results:
        extra_data['results'] = results
        if isinstance(results, dict):
            if 'energy_savings' in results:
                description += f', Εξοικονόμηση ενέργειας: {results["energy_savings"]}'
            if 'cost_savings' in results:
                description += f', Εξοικονόμηση κόστους: {results["cost_savings"]}'
    
    return log_building_activity(
        building=building,
        project=project,
        user=user,
        action_type='calculation',
        title=title,
        description=description,
        extra_data=extra_data,
        request=request
    )


def log_building_edit_activity(building, project, user, changed_fields, request=None):
    """Log building information edit activities"""
    title = 'Στοιχεία κτιρίου ενημερώθηκαν'
    
    field_names = {
        'name': 'Όνομα',
        'year_built': 'Έτος κατασκευής',
        'energy_class': 'Ενεργειακή κλάση',
        'description': 'Περιγραφή',
        'examined_area': 'Εξεταζόμενη περιοχή'
    }
    
    changed_field_names = [field_names.get(field, field) for field in changed_fields]
    description = f'Ενημερώθηκαν τα πεδία: {", ".join(changed_field_names)}'
    
    return log_building_activity(
        building=building,
        project=project,
        user=user,
        action_type='update',
        title=title,
        description=description,
        content_object=building,
        extra_data={
            'changed_fields': changed_fields,
            'action': 'update'
        },
        request=request
    )


def log_export_activity(building, project, user, export_type, file_name=None, request=None):
    """Log data export activities"""
    title = f'Εξαγωγή δεδομένων ({export_type})'
    description = f'Τύπος εξαγωγής: {export_type}'
    
    if file_name:
        description += f', Αρχείο: {file_name}'
    
    return log_building_activity(
        building=building,
        project=project,
        user=user,
        action_type='export',
        title=title,
        description=description,
        extra_data={
            'export_type': export_type,
            'file_name': file_name,
            'action': 'export'
        },
        request=request
    )


def log_import_activity(building, project, user, import_type, file_name=None, record_count=0, request=None):
    """Log data import activities"""
    title = f'Εισαγωγή δεδομένων ({import_type})'
    description = f'Τύπος εισαγωγής: {import_type}'
    
    if file_name:
        description += f', Αρχείο: {file_name}'
    if record_count:
        description += f', Εγγραφές: {record_count}'
    
    return log_building_activity(
        building=building,
        project=project,
        user=user,
        action_type='import',
        title=title,
        description=description,
        extra_data={
            'import_type': import_type,
            'file_name': file_name,
            'record_count': record_count,
            'action': 'import'
        },
        request=request
    )
