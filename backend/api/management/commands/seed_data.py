"""
LANDSAFE-NER Data Seeding Script
Seeds comprehensive geospatial locations, sensor telemetry,
historical disaster records, response units, and active alerts across all 8 NER states.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import random

from api.models import (
    Location, SensorReading, LandslideIncident,
    AlertNotification, DisasterResponseTeam
)
from ml.prediction.predictor import predictor
from ml.training.train_pipeline import NER_LOCATIONS, GEOLOGY_MAP, LAND_COVER_MAP

class Command(BaseCommand):
    help = 'Seeds initial geospatial locations, sensors, alerts, and historical landslide data for NER'

    def handle(self, *args, **options):
        self.stdout.write("Starting LANDSAFE-NER data seeding...")

        # 1. Seed Locations
        locations_created = 0
        loc_map = {}

        for loc_data in NER_LOCATIONS:
            loc, created = Location.objects.update_or_create(
                code=loc_data["id"].upper(),
                defaults={
                    "name": loc_data["name"],
                    "district": loc_data["district"],
                    "state": loc_data["state"],
                    "latitude": loc_data["lat"],
                    "longitude": loc_data["lng"],
                    "elevation": loc_data["elevation"],
                    "slope": loc_data["slope"],
                    "geology_code": loc_data["geology"],
                    "geology_description": GEOLOGY_MAP.get(loc_data["geology"], "Weathered Rock"),
                    "land_cover_code": loc_data["land_cover"],
                    "land_cover_description": LAND_COVER_MAP.get(loc_data["land_cover"], "Vegetation"),
                    "distance_to_fault_km": loc_data["fault_km"],
                    "distance_to_road_cut_m": loc_data["road_cut_m"],
                    "historical_landslides_count": random.randint(1, 8) if loc_data["slope"] > 32 else random.randint(0, 2),
                    "vulnerability_index": round(min(0.95, (loc_data["slope"] / 50.0) * 0.6 + (loc_data["geology"] / 5.0) * 0.4), 2),
                    "is_active": True
                }
            )
            loc_map[loc_data["id"]] = loc
            if created:
                locations_created += 1

        self.stdout.write(f"Seeded {len(NER_LOCATIONS)} NER locations.")

        # 2. Seed Sensor Readings (Past 24 hours timeline)
        SensorReading.objects.all().delete()
        now = timezone.now()

        for loc_id, loc in loc_map.items():
            # Set high rainfall for monsoonal hotspots
            is_critical_station = loc.district in ['North Sikkim', 'East Sikkim', 'Noney', 'Tamenglong', 'Dima Hasao', 'East Khasi Hills', 'Aizawl']
            
            base_rain24 = 145.0 if is_critical_station else random.uniform(20.0, 75.0)
            
            for h in range(24, -1, -1):
                t = now - timedelta(hours=h)
                # rainfall builds up over 24h
                progress = (24 - h) / 24.0
                curr_rain24 = round(max(0.0, base_rain24 * (0.4 + 0.6 * progress) + random.uniform(-5, 5)), 1)
                curr_rain72 = round(curr_rain24 * random.uniform(2.1, 2.7) + random.uniform(15, 30), 1)
                curr_rain1h = round(curr_rain24 * random.uniform(0.04, 0.12), 1)
                soil_m = round(min(98.0, max(25.0, 35.0 + (curr_rain24 * 0.38) + random.uniform(-3, 3))), 1)
                temp = round(max(8.0, 26.0 - (loc.elevation / 1000.0) * 5.0 + random.uniform(-1.0, 1.0)), 1)
                hum = round(min(99.0, max(50.0, 60.0 + (soil_m * 0.35) + random.uniform(-2, 2))), 1)
                pore_p = round(min(48.0, max(4.0, 8.0 + (soil_m * 0.35))), 1)
                tilt = round(max(0.1, (soil_m / 85.0) * 1.8 + (1.2 if curr_rain24 > 140 else 0.0) + random.uniform(-0.1, 0.1)), 2)

                SensorReading.objects.create(
                    location=loc,
                    timestamp=t,
                    rainfall_1h=curr_rain1h,
                    rainfall_24h=curr_rain24,
                    rainfall_72h=curr_rain72,
                    soil_moisture=soil_m,
                    temperature=temp,
                    humidity=hum,
                    pore_water_pressure_kpa=pore_p,
                    tilt_displacement_mm=tilt
                )

        self.stdout.write("Seeded 24-hour telemetry time-series.")

        # 3. Seed Historical Landslide Incidents across NER
        LandslideIncident.objects.all().delete()
        historical_records = [
            {
                "loc_code": "MN_02", "name": "Tupul Railway Yard Debris Avalanche",
                "district": "Noney", "state": "Manipur",
                "date": "2022-06-30", "severity": "CATASTROPHIC", "rain": 248.0,
                "casualties": 61, "injured": 18, "block_days": 14.0, "damage": 4200.0,
                "lat": 24.7833, "lng": 93.6333, "trigger": "Heavy continuous monsoonal downpour and excavated railway toe slope",
                "desc": "Massive slope failure along the Tupul railway yard station. Major rescue effort led by NDRF, Indian Army and SDRF."
            },
            {
                "loc_code": "SK_02", "name": "Mangan & Chungthang Flash Slide Disruption",
                "district": "North Sikkim", "state": "Sikkim",
                "date": "2023-10-04", "severity": "CATASTROPHIC", "rain": 215.0,
                "casualties": 42, "injured": 25, "block_days": 21.0, "damage": 5600.0,
                "lat": 27.5028, "lng": 88.5284, "trigger": "South Lhonak GLOF flash flood and severe slope scouring",
                "desc": "NH-10 and Mangan arterial road network severed. NHPC dam site flooded and massive slope destabilization."
            },
            {
                "loc_code": "AS_01", "name": "Haflong Hill Station Ground Subsidence",
                "district": "Dima Hasao", "state": "Assam",
                "date": "2022-05-18", "severity": "MAJOR", "rain": 195.0,
                "casualties": 8, "injured": 14, "block_days": 9.0, "damage": 1850.0,
                "lat": 25.1764, "lng": 93.0169, "trigger": "Prolonged pre-monsoon deluge saturated shale geology",
                "desc": "New Haflong railway station submerged in mud and debris; railway tracks washed down valley."
            },
            {
                "loc_code": "MZ_01", "name": "Aizawl Melthum Quarry Landslide",
                "district": "Aizawl", "state": "Mizoram",
                "date": "2024-05-28", "severity": "CATASTROPHIC", "rain": 210.0,
                "casualties": 34, "injured": 12, "block_days": 6.0, "damage": 1200.0,
                "lat": 23.7271, "lng": 92.7176, "trigger": "Cyclone Remal extreme rainfall inducing stone quarry collapse",
                "desc": "Multiple landslides triggered across Aizawl urban perimeter, collapsing quarry worker settlements."
            },
            {
                "loc_code": "SK_01", "name": "Gangtok Chandmari & Burtuk Slump",
                "district": "East Sikkim", "state": "Sikkim",
                "date": "2021-07-12", "severity": "MAJOR", "rain": 165.0,
                "casualties": 3, "injured": 7, "block_days": 4.0, "damage": 650.0,
                "lat": 27.3389, "lng": 88.6065, "trigger": "Intense cloudburst over saturated Phyllite bedrock",
                "desc": "NH-10 blocked at several chokepoints between Singtam and Gangtok; multi-story buildings evacuated."
            },
            {
                "loc_code": "AR_02", "name": "Tawang Sela Pass Route Blockage",
                "district": "Tawang", "state": "Arunachal Pradesh",
                "date": "2023-08-19", "severity": "MODERATE", "rain": 140.0,
                "casualties": 0, "injured": 2, "block_days": 3.0, "damage": 220.0,
                "lat": 27.5861, "lng": 91.8653, "trigger": "Permafrost melting combined with heavy monsoon rain",
                "desc": "Strategic border road blocked by rockfall and mudflow; BRO deployed heavy bulldozers."
            },
            {
                "loc_code": "NL_01", "name": "Kohima-Phesama NH-29 Sinking Zone",
                "district": "Kohima", "state": "Nagaland",
                "date": "2022-08-05", "severity": "MAJOR", "rain": 178.0,
                "casualties": 2, "injured": 5, "block_days": 7.0, "damage": 850.0,
                "lat": 25.6751, "lng": 94.1086, "trigger": "Continuous monsoonal seepage across Disang shale formation",
                "desc": "Vital lifeline connecting Manipur to Assam severed for a week; heavy vehicles stranded."
            },
            {
                "loc_code": "ML_02", "name": "Cherrapunji (Sohra-Shella Road) Escarpment Slide",
                "district": "East Khasi Hills", "state": "Meghalaya",
                "date": "2023-06-16", "severity": "MAJOR", "rain": 290.0,
                "casualties": 4, "injured": 9, "block_days": 5.0, "damage": 480.0,
                "lat": 25.2700, "lng": 91.7300, "trigger": "World's highest rainfall belt flash downpour",
                "desc": "Massive sandstone boulders cascaded onto tourist corridor and limestone quarry haul roads."
            }
        ]

        for h in historical_records:
            loc_obj = Location.objects.filter(code=h["loc_code"]).first()
            LandslideIncident.objects.create(
                location=loc_obj,
                incident_name=h["name"],
                district=h["district"],
                state=h["state"],
                incident_date=datetime.strptime(h["date"], "%Y-%m-%d").date(),
                severity=h["severity"],
                rainfall_amount_mm=h["rain"],
                casualties=h["casualties"],
                injured=h["injured"],
                road_blocked_days=h["block_days"],
                estimated_damage_inr_lakhs=h["damage"],
                latitude=h["lat"],
                longitude=h["lng"],
                trigger_type=h["trigger"],
                description=h["desc"]
            )
        self.stdout.write(f"Seeded {len(historical_records)} historical disaster incident records.")

        # 4. Seed Active Alerts
        AlertNotification.objects.all().delete()
        alerts_data = [
            {
                "loc_code": "SK_02",
                "title": "🚨 CRITICAL LANDSLIDE ALERT: Mangan (Dikchu Sector)",
                "risk_level": "CRITICAL", "prob": 0.94, "rain24": 192.0, "rain72": 410.0, "moist": 94.5,
                "reason": "Extreme monsoonal saturation (192mm/24h) in weak Foliated Schist zone. Subsurface tilt rate exceeded 1.8mm/hr.",
                "action": "Immediate evacuation of lower Dikchu riverbank settlements. Halt all transit on Chungthang highway."
            },
            {
                "loc_code": "MN_02",
                "title": "🚨 CRITICAL LANDSLIDE ALERT: Noney (Tupul Catchment)",
                "risk_level": "CRITICAL", "prob": 0.89, "rain24": 174.0, "rain72": 360.0, "moist": 91.0,
                "reason": "Severe rainfall threshold breached on 43° slope. Ije river drainage bottleneck susceptible to damming.",
                "action": "Issue red alert to Tupul sub-division administration. Mobilize NDRF 12th Battalion standby units."
            },
            {
                "loc_code": "SK_01",
                "title": "⚠️ HIGH LANDSLIDE WARNING: Gangtok (Chandmari Slope)",
                "risk_level": "HIGH", "prob": 0.78, "rain24": 138.0, "rain72": 290.0, "moist": 86.2,
                "reason": "High rainfall saturation on urban slope cut with dense multi-story settlement surcharge.",
                "action": "Restrict heavy vehicular movement along Gangtok-Nathula highway. SDRF Quick Response Team on standby."
            },
            {
                "loc_code": "MZ_01",
                "title": "⚠️ HIGH LANDSLIDE WARNING: Aizawl (Ramhlun / Hunthar Sinking Area)",
                "risk_level": "HIGH", "prob": 0.76, "rain24": 125.0, "rain72": 265.0, "moist": 84.0,
                "reason": "Water table elevation and structural pore pressure build-up in urban sandstone-shale bedrock.",
                "action": "Deploy municipal engineers to inspect stormwater drain bypass channels."
            }
        ]

        for a in alerts_data:
            loc_obj = Location.objects.filter(code=a["loc_code"]).first()
            if loc_obj:
                AlertNotification.objects.create(
                    location=loc_obj,
                    alert_code=f"ALERT-NER-{loc_obj.code}-LIVE",
                    title=a["title"],
                    risk_level=a["risk_level"],
                    risk_probability=a["prob"],
                    rainfall_24h=a["rain24"],
                    rainfall_72h=a["rain72"],
                    soil_moisture=a["moist"],
                    trigger_reason=a["reason"],
                    recommended_action=a["action"],
                    status='ACTIVE',
                    channels_dispatched="SMS, Email, NDRF Alert Portal, Public Siren",
                    recipients_notified=random.randint(55, 110),
                    created_at=now - timedelta(minutes=random.randint(15, 120))
                )
        self.stdout.write("Seeded active early warning alerts.")

        # 5. Seed Disaster Response Teams
        DisasterResponseTeam.objects.all().delete()
        teams = [
            {"unit": "NDRF 1st Battalion (HQ)", "state": "Assam", "district": "Kamrup Metro", "station": "Patgaon, Guwahati", "commander": "Commandant R. K. Sharma", "phone": "+91-361-2849005", "readiness": "HIGH_ALERT", "count": 120, "lat": 26.1158, "lng": 91.7086},
            {"unit": "SDRF Sikkim Quick Response Unit", "state": "Sikkim", "district": "East Sikkim", "station": "Gangtok Control Room", "commander": "Inspector Tenzing Bhutia", "phone": "+91-3592-202022", "readiness": "DEPLOYED", "count": 45, "lat": 27.3389, "lng": 88.6065},
            {"unit": "NDRF 12th Battalion (Manipur Unit)", "state": "Manipur", "district": "Noney", "station": "Noney Field Station", "commander": "Dy. Commandant S. Singh", "phone": "+91-385-2450112", "readiness": "HIGH_ALERT", "count": 65, "lat": 24.7833, "lng": 93.6333},
            {"unit": "SDRF Meghalaya Mountain Rescue Team", "state": "Meghalaya", "district": "East Khasi Hills", "station": "Upper Shillong Fire Station", "commander": "Sub-Inspector P. Marbaniang", "phone": "+91-364-2501001", "readiness": "STANDBY", "count": 35, "lat": 25.5788, "lng": 91.8933},
            {"unit": "SDRF Mizoram Disaster Response Unit", "state": "Mizoram", "district": "Aizawl", "station": "Aizawl Central Base", "commander": "Captain L. Ralte", "phone": "+91-389-2334455", "readiness": "HIGH_ALERT", "count": 50, "lat": 23.7271, "lng": 92.7176},
            {"unit": "Arunachal Disaster Mitigation Force", "state": "Arunachal Pradesh", "district": "Papum Pare", "station": "Itanagar QRT Centre", "commander": "Inspector T. Tana", "phone": "+91-360-2212345", "readiness": "STANDBY", "count": 40, "lat": 27.0844, "lng": 93.6053}
        ]

        for tm in teams:
            DisasterResponseTeam.objects.create(
                unit_name=tm["unit"],
                state=tm["state"],
                district=tm["district"],
                base_station=tm["station"],
                commander_name=tm["commander"],
                contact_phone=tm["phone"],
                readiness_level=tm["readiness"],
                personnel_count=tm["count"],
                latitude=tm["lat"],
                longitude=tm["lng"]
            )
        self.stdout.write(f"Seeded {len(teams)} disaster response teams.")
        self.stdout.write("LANDSAFE-NER database seeding complete!")
