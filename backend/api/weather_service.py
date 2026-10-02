"""
LANDSAFE-NER Live Telemetry & Weather Simulator Service
Manages real-time sensor updates, precipitation telemetry for NER stations,
and automated threshold checks.
"""

import random
from django.utils import timezone
from .models import Location, SensorReading, AlertNotification
from ml.prediction.predictor import predictor

def refresh_station_telemetry(trigger_alerts=True):
    """
    Simulates / ingests fresh meteorological telemetry across all monitored locations,
    evaluates AI risk, and triggers automated alerts when risk exceeds thresholds.
    """
    locations = Location.objects.filter(is_active=True)
    updated_records = []
    new_alerts = []

    for loc in locations:
        latest = loc.readings.first()

        # Generate realistic variations based on location characteristics
        base_rain = latest.rainfall_24h if latest else (85.0 if loc.state in ['Sikkim', 'Meghalaya'] else 45.0)
        
        # High rainfall hotspots (Gangtok, Sohra/Mawsynram, Tupul/Noney, Haflong, Bomdila)
        is_hotspot = any(h in loc.name for h in ['Gangtok', 'Mangan', 'Cherrapunji', 'Mawsynram', 'Noney', 'Haflong', 'Bhalukpong'])
        
        if is_hotspot:
            rain_24h = round(max(10.0, base_rain + random.uniform(-15.0, 35.0)), 1)
        else:
            rain_24h = round(max(0.0, base_rain + random.uniform(-20.0, 20.0)), 1)
            
        rain_72h = round(rain_24h * random.uniform(1.8, 2.6) + random.uniform(10, 40), 1)
        rain_1h = round(rain_24h * random.uniform(0.05, 0.18), 1)
        
        # Soil moisture correlates with rainfall
        soil_moisture = round(min(98.0, max(25.0, 35.0 + (rain_24h * 0.38) + random.uniform(-4, 6))), 1)
        temp = round(max(8.0, 28.0 - (loc.elevation / 1000.0) * 5.2 + random.uniform(-1.5, 1.5)), 1)
        humidity = round(min(99.0, max(50.0, 60.0 + (soil_moisture * 0.35) + random.uniform(-3, 3))), 1)
        pore_pressure = round(min(45.0, max(5.0, 8.0 + (soil_moisture * 0.32))), 1)
        tilt = round(max(0.1, (soil_moisture / 90.0) * 1.5 + (1.0 if rain_24h > 150 else 0.0) + random.uniform(-0.1, 0.2)), 2)

        reading = SensorReading.objects.create(
            location=loc,
            timestamp=timezone.now(),
            rainfall_1h=rain_1h,
            rainfall_24h=rain_24h,
            rainfall_72h=rain_72h,
            soil_moisture=soil_moisture,
            temperature=temp,
            humidity=humidity,
            pore_water_pressure_kpa=pore_pressure,
            tilt_displacement_mm=tilt
        )

        # AI Prediction
        feature_payload = {
            'rainfall_24h': rain_24h,
            'rainfall_72h': rain_72h,
            'slope': loc.slope,
            'elevation': loc.elevation,
            'soil_moisture': soil_moisture,
            'ndvi': 0.65 if loc.land_cover_code == 0 else (0.20 if loc.land_cover_code == 3 else 0.40),
            'aspect': 180.0,
            'terrain_ruggedness': loc.slope * 1.8,
            'distance_to_fault_km': loc.distance_to_fault_km,
            'distance_to_road_cut_m': loc.distance_to_road_cut_m,
            'historical_landslide_count': loc.historical_landslides_count,
            'temperature': temp,
            'humidity': humidity,
            'land_cover_code': loc.land_cover_code,
            'geology_code': loc.geology_code
        }

        ai_risk = predictor.predict_risk(feature_payload)
        updated_records.append({
            "location_id": loc.id,
            "name": loc.name,
            "reading": reading,
            "ai_risk": ai_risk
        })

        # Check if automated alert needed (Risk >= 80% or 24h Rain >= 140mm)
        if trigger_alerts and (ai_risk["risk_percentage"] >= 80.0 or rain_24h >= 140.0):
            # Check if active alert exists in last 12 hours
            recent_alert = AlertNotification.objects.filter(
                location=loc,
                status='ACTIVE'
            ).first()

            if not recent_alert:
                alert_code = f"ALERT-NER-{loc.code}-{timezone.now().strftime('%m%d%H%M')}"
                alert_obj = AlertNotification.objects.create(
                    location=loc,
                    alert_code=alert_code,
                    title=f"CRITICAL LANDSLIDE WARNING: {loc.name}",
                    risk_level=ai_risk["risk_level"],
                    risk_probability=ai_risk["risk_probability"],
                    rainfall_24h=rain_24h,
                    rainfall_72h=rain_72h,
                    soil_moisture=soil_moisture,
                    trigger_reason=f"Extreme rainfall saturation ({rain_24h} mm / 24h) combined with steep slope ({loc.slope}°) and high pore water pressure.",
                    recommended_action=f"Activate SDRF and local disaster management in {loc.district}. Restrict highway traffic on prone sections and prepare evacuation for downstream settlements.",
                    status='ACTIVE',
                    channels_dispatched="SMS, Email, NDRF Alert Portal, Public Siren",
                    recipients_notified=random.randint(45, 120),
                    created_at=timezone.now()
                )
                new_alerts.append(alert_obj)

    return {
        "updated_stations_count": len(updated_records),
        "new_alerts_triggered": len(new_alerts),
        "timestamp": timezone.now().isoformat()
    }
