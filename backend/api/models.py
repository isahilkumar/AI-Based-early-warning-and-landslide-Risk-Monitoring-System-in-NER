"""
LANDSAFE-NER Django Models
Represents Geospatial Locations, Live Sensor Telemetry, Historical Landslide Incidents,
Early Warning Alerts, Citizen Ground Reports, Emergency Facilities, and Safe Evacuation Routes across North Eastern India.
"""

from django.db import models
from django.utils import timezone

class Location(models.Model):
    code = models.CharField(max_length=32, unique=True, db_index=True)
    name = models.CharField(max_length=150)
    district = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    elevation = models.FloatField(help_text="Elevation in meters above sea level")
    slope = models.FloatField(help_text="Slope angle in degrees")
    geology_code = models.IntegerField(default=4)
    geology_description = models.CharField(max_length=150, default="Weathered Sandstone & Shale")
    land_cover_code = models.IntegerField(default=1)
    land_cover_description = models.CharField(max_length=150, default="Shrubland / Degraded Forest")
    distance_to_fault_km = models.FloatField(default=5.0)
    distance_to_road_cut_m = models.FloatField(default=50.0)
    historical_landslides_count = models.IntegerField(default=0)
    vulnerability_index = models.FloatField(default=0.5, help_text="0.0 to 1.0 composite baseline vulnerability")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['state', 'district', 'name']

    def __str__(self):
        return f"{self.name} ({self.district}, {self.state})"


class SensorReading(models.Model):
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='readings')
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    rainfall_1h = models.FloatField(default=0.0)
    rainfall_24h = models.FloatField(default=0.0)
    rainfall_72h = models.FloatField(default=0.0)
    soil_moisture = models.FloatField(default=45.0, help_text="Soil volumetric water content %")
    temperature = models.FloatField(default=22.0, help_text="Temperature in Celsius")
    humidity = models.FloatField(default=75.0, help_text="Relative humidity %")
    pore_water_pressure_kpa = models.FloatField(default=12.5, help_text="Pore water pressure in kPa")
    tilt_displacement_mm = models.FloatField(default=0.2, help_text="Subsurface tilt displacement in mm")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.location.name} @ {self.timestamp.strftime('%Y-%m-%d %H:%M')} (Rain: {self.rainfall_24h}mm)"


class LandslideIncident(models.Model):
    SEVERITY_CHOICES = [
        ('LOW', 'Low / Local Slump'),
        ('MODERATE', 'Moderate Debris Flow'),
        ('MAJOR', 'Major Highway Blockage / Structural Damage'),
        ('CATASTROPHIC', 'Catastrophic Mass Movement / Disaster'),
    ]

    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents')
    incident_name = models.CharField(max_length=200)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    incident_date = models.DateField(db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MODERATE')
    rainfall_amount_mm = models.FloatField(help_text="24h rainfall preceding landslide")
    casualties = models.IntegerField(default=0)
    injured = models.IntegerField(default=0)
    road_blocked_days = models.FloatField(default=1.0)
    estimated_damage_inr_lakhs = models.FloatField(default=15.0)
    latitude = models.FloatField()
    longitude = models.FloatField()
    trigger_type = models.CharField(max_length=100, default="Continuous Monsoonal Downpour")
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-incident_date']

    def __str__(self):
        return f"{self.incident_name} ({self.incident_date}) - {self.severity}"


class AlertNotification(models.Model):
    RISK_LEVEL_CHOICES = [
        ('LOW', 'Low Risk - Normal'),
        ('MEDIUM', 'Medium Risk - Watch'),
        ('HIGH', 'High Risk - Warning'),
        ('CRITICAL', 'Critical Risk - Emergency Alert'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active Alert'),
        ('ACKNOWLEDGED', 'Acknowledged by Response Teams'),
        ('RESOLVED', 'Resolved / Downgraded'),
    ]

    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='alerts')
    alert_code = models.CharField(max_length=32, unique=True)
    title = models.CharField(max_length=200)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, default='HIGH')
    risk_probability = models.FloatField()
    rainfall_24h = models.FloatField()
    rainfall_72h = models.FloatField(default=0.0)
    soil_moisture = models.FloatField(default=80.0)
    trigger_reason = models.TextField()
    recommended_action = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE', db_index=True)
    channels_dispatched = models.CharField(max_length=255, default="Web Dashboard, SMS, Email, NDRF Alert Network")
    recipients_notified = models.IntegerField(default=48)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    acknowledged_by = models.CharField(max_length=150, blank=True, null=True)
    acknowledged_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.risk_level}] {self.title} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


class DisasterResponseTeam(models.Model):
    unit_name = models.CharField(max_length=150)
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    base_station = models.CharField(max_length=150)
    commander_name = models.CharField(max_length=100)
    contact_phone = models.CharField(max_length=50)
    readiness_level = models.CharField(max_length=50, default="HIGH_ALERT")
    personnel_count = models.IntegerField(default=40)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"{self.unit_name} - {self.district}, {self.state}"


class CitizenReport(models.Model):
    INCIDENT_TYPE_CHOICES = [
        ('ROAD_CRACK', 'Road / Pavement Tension Crack'),
        ('SOIL_SLUMP', 'Soil Subsidence / Ground Slumping'),
        ('ROCKFALL', 'Rockfall / Boulders on Highway'),
        ('WATER_SEEPAGE', 'Muddy Water Seepage from Slope'),
        ('ACTIVE_LANDSLIDE', 'Active Landslide / Debris Flow'),
    ]

    STATUS_CHOICES = [
        ('PENDING_REVIEW', 'Pending Verification'),
        ('VERIFIED_DISPATCHED', 'Verified & Response Dispatched'),
        ('RESOLVED', 'Resolved & Hazard Cleared'),
        ('REJECTED', 'False Alarm / Duplicate'),
    ]

    reporter_name = models.CharField(max_length=100, default="Anonymous Resident")
    reporter_phone = models.CharField(max_length=30, blank=True, default="")
    incident_type = models.CharField(max_length=30, choices=INCIDENT_TYPE_CHOICES, default='ROAD_CRACK')
    location_name = models.CharField(max_length=150)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    description = models.TextField()
    photo_url = models.CharField(max_length=500, blank=True, default="")
    
    # AI Vision Computer Vision Assessment
    ai_vision_findings = models.TextField(blank=True, default="AI Vision analysis completed.")
    ai_risk_score = models.FloatField(default=75.0)
    ai_severity = models.CharField(max_length=20, default="HIGH")
    ai_confidence = models.FloatField(default=92.5)
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING_REVIEW', db_index=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    reviewed_by = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.incident_type}] {self.location_name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


class EmergencyFacility(models.Model):
    FACILITY_TYPE_CHOICES = [
        ('HOSPITAL', 'Civil Hospital / Trauma Center'),
        ('SHELTER', 'Disaster Relief Shelter'),
        ('NDRF_CAMP', 'NDRF / SDRF Staging Base'),
        ('POLICE_HQ', 'District Police Headquarters'),
        ('FIRE_STATION', 'Fire & Emergency Rescue Station'),
    ]

    name = models.CharField(max_length=150)
    facility_type = models.CharField(max_length=30, choices=FACILITY_TYPE_CHOICES, default='HOSPITAL')
    state = models.CharField(max_length=100, db_index=True)
    district = models.CharField(max_length=100, db_index=True)
    address = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    capacity = models.IntegerField(default=100, help_text="Beds or personnel capacity")
    emergency_phone = models.CharField(max_length=50)
    status = models.CharField(max_length=30, default="OPERATIONAL")

    def __str__(self):
        return f"{self.name} ({self.facility_type}) - {self.district}, {self.state}"


class SafeEvacuationRoute(models.Model):
    name = models.CharField(max_length=200)
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    origin_area = models.CharField(max_length=150)
    destination_facility = models.ForeignKey(EmergencyFacility, on_delete=models.CASCADE, related_name='evacuation_routes')
    distance_km = models.FloatField(default=12.5)
    estimated_time_mins = models.IntegerField(default=25)
    safety_status = models.CharField(max_length=30, default="RECOMMENDED_SAFE")
    hazard_road_status = models.CharField(max_length=30, default="BLOCKED_HIGH_RISK")
    safe_waypoints_json = models.TextField(help_text="JSON list of [lat, lng] for safe green route")
    hazard_waypoints_json = models.TextField(help_text="JSON list of [lat, lng] for red blocked road")
    advisory_notes = models.TextField(blank=True)

    def __str__(self):
        return f"Route: {self.origin_area} -> {self.destination_facility.name}"
