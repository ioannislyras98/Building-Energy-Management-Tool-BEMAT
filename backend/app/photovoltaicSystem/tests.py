from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from building.models import Building
from project.models import Project
from .models import PhotovoltaicSystem
import uuid

User = get_user_model()

class PhotovoltaicSystemModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.project = Project.objects.create(
            name='Test Project',
            user=self.user,
            cost_per_kwh_fuel=0.10,
            cost_per_kwh_electricity=0.15
        )
        self.building = Building.objects.create(
            name='Test Building',
            project=self.project,
            user=self.user
        )

    def test_photovoltaic_system_creation(self):
        """Test δημιουργίας φωτοβολταϊκού συστήματος"""
        pv_system = PhotovoltaicSystem.objects.create(
            user=self.user,
            building=self.building,
            project=self.project,
            pv_panels_quantity=10,
            pv_panels_unit_price=300.00,
            power_per_panel=250,
            pv_system_type='Μονοκρυσταλλικό'
        )
        
        self.assertEqual(pv_system.user, self.user)
        self.assertEqual(pv_system.building, self.building)
        self.assertEqual(pv_system.project, self.project)
        self.assertEqual(pv_system.pv_panels_quantity, 10)
        self.assertEqual(pv_system.pv_panels_unit_price, 300.00)
        self.assertEqual(pv_system.pv_panels_cost, 3000.00)  # Αυτόματος υπολογισμός

    def test_cost_calculations(self):
        """Test υπολογισμών κόστους"""
        pv_system = PhotovoltaicSystem.objects.create(
            user=self.user,
            building=self.building,
            project=self.project,
            pv_panels_quantity=10,
            pv_panels_unit_price=300.00,
            metal_bases_quantity=5,
            metal_bases_unit_price=50.00,
            inverter_quantity=1,
            inverter_unit_price=500.00
        )
        
        # Test συνολικού κόστους εξοπλισμού
        expected_equipment_cost = 3000 + 250 + 500  # 3750
        self.assertEqual(pv_system.calculate_total_equipment_cost(), expected_equipment_cost)
        
        # Test απρόβλεπτων δαπανών (9%)
        expected_unexpected = expected_equipment_cost * 0.09
        self.assertEqual(pv_system.calculate_unexpected_expenses(), expected_unexpected)
        
        # Test φόρου (24%)
        value_after_unexpected = expected_equipment_cost + expected_unexpected
        expected_tax = value_after_unexpected * 0.24
        self.assertEqual(pv_system.calculate_tax_burden(), expected_tax)

    def test_string_representation(self):
        """Test string representation"""
        pv_system = PhotovoltaicSystem.objects.create(
            user=self.user,
            building=self.building,
            project=self.project
        )
        
        expected_str = f"Φωτοβολταϊκό σύστημα - {self.building.name}"
        self.assertEqual(str(pv_system), expected_str)


class PhotovoltaicSystemAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.project = Project.objects.create(
            name='Test Project',
            user=self.user,
            cost_per_kwh_fuel=0.10,
            cost_per_kwh_electricity=0.15
        )
        self.building = Building.objects.create(
            name='Test Building',
            project=self.project,
            user=self.user
        )
        self.client.force_authenticate(user=self.user)

    def test_create_photovoltaic_system(self):
        """Test δημιουργίας φωτοβολταϊκού συστήματος μέσω API"""
        url = reverse('photovoltaic-system-list-create')
        data = {
            'building': self.building.uuid,
            'project': self.project.uuid,
            'pv_panels_quantity': 15,
            'pv_panels_unit_price': 280.00,
            'power_per_panel': 300,
            'pv_system_type': 'Πολυκρυσταλλικό',
            'pv_usage': 'Για ίδια κατανάλωση'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Έλεγχος ότι δημιουργήθηκε το αντικείμενο
        self.assertTrue(PhotovoltaicSystem.objects.filter(
            building=self.building,
            project=self.project
        ).exists())

    def test_list_photovoltaic_systems(self):
        """Test λίστας φωτοβολταϊκών συστημάτων"""
        # Δημιουργία test data
        PhotovoltaicSystem.objects.create(
            user=self.user,
            building=self.building,
            project=self.project,
            pv_system_type='Μονοκρυσταλλικό'
        )
        
        url = reverse('photovoltaic-system-list-create')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['pv_system_type'], 'Μονοκρυσταλλικό')

    def test_photovoltaic_system_detail(self):
        """Test λεπτομερειών φωτοβολταϊκού συστήματος"""
        pv_system = PhotovoltaicSystem.objects.create(
            user=self.user,
            building=self.building,
            project=self.project,
            pv_system_type='Μονοκρυσταλλικό'
        )
        
        url = reverse('photovoltaic-system-detail', kwargs={'uuid': pv_system.uuid})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['uuid'], str(pv_system.uuid))
        self.assertEqual(response.data['pv_system_type'], 'Μονοκρυσταλλικό')

    def test_photovoltaic_system_summary(self):
        """Test στατιστικών φωτοβολταϊκών συστημάτων"""
        # Δημιουργία test data
        PhotovoltaicSystem.objects.create(
            user=self.user,
            building=self.building,
            project=self.project,
            pv_panels_quantity=10,
            power_per_panel=250,
            pv_system_type='Μονοκρυσταλλικό'
        )
        
        url = reverse('photovoltaic-system-summary')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_systems'], 1)
        self.assertEqual(response.data['total_power'], 2500)  # 10 * 250

    def test_calculate_photovoltaic_costs(self):
        """Test υπολογισμού κόστους φωτοβολταϊκού συστήματος"""
        url = reverse('calculate-photovoltaic-costs')
        data = {
            'pv_panels_quantity': 10,
            'pv_panels_unit_price': 300,
            'inverter_quantity': 1,
            'inverter_unit_price': 500
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Έλεγχος υπολογισμών
        self.assertEqual(response.data['total_equipment_cost'], 3500)  # 3000 + 500
        self.assertEqual(response.data['unexpected_expenses'], 315)  # 3500 * 0.09

    def test_filter_by_building(self):
        """Test φιλτραρίσματος ανά κτίριο"""
        # Δημιουργία άλλου κτιρίου
        other_building = Building.objects.create(
            name='Other Building',
            project=self.project,
            user=self.user
        )
        
        # Δημιουργία φωτοβολταϊκών συστημάτων
        PhotovoltaicSystem.objects.create(
            user=self.user,
            building=self.building,
            project=self.project
        )
        PhotovoltaicSystem.objects.create(
            user=self.user,
            building=other_building,
            project=self.project
        )
        
        # Test φιλτραρίσματος
        url = reverse('photovoltaic-systems-by-building', kwargs={'building_uuid': self.building.uuid})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['building'], str(self.building.uuid))

    def test_unauthorized_access(self):
        """Test μη εξουσιοδοτημένης πρόσβασης"""
        self.client.force_authenticate(user=None)
        
        url = reverse('photovoltaic-system-list-create')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
