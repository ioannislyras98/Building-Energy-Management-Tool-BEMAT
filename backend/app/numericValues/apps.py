from django.apps import AppConfig


class NumericValuesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'numericValues'
    verbose_name = 'Αριθμητικές Τιμές'
    
    def ready(self):
        """
        Καλείται όταν το app είναι έτοιμο
        """
        pass