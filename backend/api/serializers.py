"""
Serializers for LANDSAFE-NER API
"""

from rest_framework import serializers
from .models import (
    Location, SensorReading, LandslideIncident, AlertNotification,
    DisasterResponseTeam, CitizenReport, EmergencyFacility, SafeEvacuationRoute
)

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = '__all__'


class LandslideIncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandslideIncident
        fields = '__all__'


class AlertNotificationSerializer(serializers.ModelSerializer):
    location_name = serializers.ReadOnlyField(source='location.name')
    district = serializers.ReadOnlyField(source='location.district')
    state = serializers.ReadOnlyField(source='location.state')

    class Meta:
        model = AlertNotification
        fields = '__all__'


class DisasterResponseTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = DisasterResponseTeam
        fields = '__all__'


class CitizenReportSerializer(serializers.ModelSerializer):
    formatted_time = serializers.SerializerMethodField()

    class Meta:
        model = CitizenReport
        fields = '__all__'

    def get_formatted_time(self, obj):
        return obj.created_at.strftime('%d %b %Y, %I:%M %p IST')


class EmergencyFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyFacility
        fields = '__all__'


class SafeEvacuationRouteSerializer(serializers.ModelSerializer):
    destination_name = serializers.ReadOnlyField(source='destination_facility.name')
    facility_type = serializers.ReadOnlyField(source='destination_facility.facility_type')
    facility_phone = serializers.ReadOnlyField(source='destination_facility.emergency_phone')

    class Meta:
        model = SafeEvacuationRoute
        fields = '__all__'


class LocationSerializer(serializers.ModelSerializer):
    latest_reading = serializers.SerializerMethodField()
    live_risk = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = [
            'id', 'code', 'name', 'district', 'state', 'latitude', 'longitude',
            'elevation', 'slope', 'geology_code', 'geology_description',
            'land_cover_code', 'land_cover_description', 'distance_to_fault_km',
            'distance_to_road_cut_m', 'historical_landslides_count',
            'vulnerability_index', 'is_active', 'latest_reading', 'live_risk'
        ]

    def get_latest_reading(self, obj):
        reading = obj.readings.first()
        if reading:
            return SensorReadingSerializer(reading).data
        return None

    def get_live_risk(self, obj):
        if hasattr(obj, 'computed_risk'):
            return obj.computed_risk
        return None
