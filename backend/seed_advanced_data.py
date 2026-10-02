"""
Seed script for Advanced Disaster Management Modules:
- Emergency Facilities (Hospitals, Shelters, NDRF bases across all 8 NER states)
- Safe Evacuation Routes (Green Safe vs Red Hazard blocked roads)
- Citizen Reports with AI Vision Computer Vision findings
"""

import os
import sys
import json
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'landsafener_backend.settings')
django.setup()

from api.models import EmergencyFacility, SafeEvacuationRoute, CitizenReport, Location

print("Seeding Emergency Facilities...")
facilities_data = [
    {
        "name": "STNM Multi-Speciality Hospital",
        "facility_type": "HOSPITAL",
        "state": "Sikkim",
        "district": "East Sikkim",
        "address": "Sochakgang, Sichey, Gangtok, Sikkim 737101",
        "latitude": 27.3245,
        "longitude": 88.6080,
        "capacity": 550,
        "emergency_phone": "03592-202944 / 102",
        "status": "OPERATIONAL"
    },
    {
        "name": "Gangtok Palzor Indoor Stadium Relief Shelter",
        "facility_type": "SHELTER",
        "state": "Sikkim",
        "district": "East Sikkim",
        "address": "Palzor Stadium Road, Gangtok",
        "latitude": 27.3312,
        "longitude": 88.6145,
        "capacity": 1200,
        "emergency_phone": "03592-201075",
        "status": "OPERATIONAL"
    },
    {
        "name": "NDRF 2nd Bn Staging Base Ranipool",
        "facility_type": "NDRF_CAMP",
        "state": "Sikkim",
        "district": "East Sikkim",
        "address": "Ranipool NH-10 Crossing, East Sikkim",
        "latitude": 27.2840,
        "longitude": 88.5860,
        "capacity": 150,
        "emergency_phone": "03592-251210 / 1070",
        "status": "OPERATIONAL"
    },
    {
        "name": "Gauhati Medical College & Hospital (GMCH)",
        "facility_type": "HOSPITAL",
        "state": "Assam",
        "district": "Kamrup Metropolitan",
        "address": "Narakasur Hilltop, Bhangagarh, Guwahati, Assam",
        "latitude": 26.1558,
        "longitude": 91.7682,
        "capacity": 1800,
        "emergency_phone": "0361-2529457 / 108",
        "status": "OPERATIONAL"
    },
    {
        "name": "Sarunsajai Stadium Emergency Relief Camp",
        "facility_type": "SHELTER",
        "state": "Assam",
        "district": "Kamrup Metropolitan",
        "address": "Sarusajai Sports Complex, Guwahati, Assam",
        "latitude": 26.1150,
        "longitude": 91.7580,
        "capacity": 3000,
        "emergency_phone": "0361-2237011",
        "status": "OPERATIONAL"
    },
    {
        "name": "NEIGRIHMS Multi-Speciality Institute",
        "facility_type": "HOSPITAL",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "address": "Mawdiangdiang, Shillong, Meghalaya 793018",
        "latitude": 25.5920,
        "longitude": 91.9340,
        "capacity": 650,
        "emergency_phone": "0364-2538012",
        "status": "OPERATIONAL"
    },
    {
        "name": "Tomo Riba Institute of Health (TRIHMS) Naharlagun",
        "facility_type": "HOSPITAL",
        "state": "Arunachal Pradesh",
        "district": "Papum Pare",
        "address": "Naharlagun, Itanagar Capital Complex, Arunachal Pradesh",
        "latitude": 27.1060,
        "longitude": 93.6980,
        "capacity": 400,
        "emergency_phone": "0360-2244222",
        "status": "OPERATIONAL"
    },
    {
        "name": "Naga Hospital Authority Kohima",
        "facility_type": "HOSPITAL",
        "state": "Nagaland",
        "district": "Kohima",
        "address": "Hospital Colony, Kohima, Nagaland",
        "latitude": 25.6680,
        "longitude": 94.1080,
        "capacity": 350,
        "emergency_phone": "0370-2244001",
        "status": "OPERATIONAL"
    },
    {
        "name": "Regional Institute of Medical Sciences (RIMS) Imphal",
        "facility_type": "HOSPITAL",
        "state": "Manipur",
        "district": "Imphal West",
        "address": "Lamphelpat, Imphal, Manipur",
        "latitude": 24.8190,
        "longitude": 93.9210,
        "capacity": 1050,
        "emergency_phone": "0385-2414629",
        "status": "OPERATIONAL"
    },
    {
        "name": "Zoram Medical College (ZMC) Falkawn",
        "facility_type": "HOSPITAL",
        "state": "Mizoram",
        "district": "Aizawl",
        "address": "Falkawn, Aizawl, Mizoram",
        "latitude": 23.6420,
        "longitude": 92.7310,
        "capacity": 400,
        "emergency_phone": "0389-2350507",
        "status": "OPERATIONAL"
    },
    {
        "name": "Agartala Government Medical College & GBP Hospital",
        "facility_type": "HOSPITAL",
        "state": "Tripura",
        "district": "West Tripura",
        "address": "Kunjaban, Agartala, Tripura",
        "latitude": 23.8560,
        "longitude": 91.2980,
        "capacity": 850,
        "emergency_phone": "0381-2356701",
        "status": "OPERATIONAL"
    }
]

for fac in facilities_data:
    EmergencyFacility.objects.update_or_create(
        name=fac["name"],
        defaults=fac
    )

print(f"Loaded {EmergencyFacility.objects.count()} Emergency Facilities.")

# Seed Evacuation Routes
print("Seeding Safe Evacuation Routes...")
stnm = EmergencyFacility.objects.filter(name__icontains="STNM").first()
if stnm:
    SafeEvacuationRoute.objects.update_or_create(
        name="Gangtok NH-10 Fracture Bypass -> STNM Hospital Corridor",
        defaults={
            "state": "Sikkim",
            "district": "East Sikkim",
            "origin_area": "Tadong Lower Slope / 6th Mile Fracture Zone",
            "destination_facility": stnm,
            "distance_km": 8.4,
            "estimated_time_mins": 18,
            "safety_status": "RECOMMENDED_SAFE",
            "hazard_road_status": "BLOCKED_HIGH_RISK",
            "safe_waypoints_json": json.dumps([
                [27.3180, 88.5990],
                [27.3195, 88.6015],
                [27.3220, 88.6050],
                [27.3245, 88.6080]
            ]),
            "hazard_waypoints_json": json.dumps([
                [27.3180, 88.5990],
                [27.3150, 88.5940],
                [27.3120, 88.5900],
                [27.3080, 88.5850]
            ]),
            "advisory_notes": "NH-10 lower carriageway blocked by continuous debris slurry at 6th Mile. Utilize the ridge bypass via Sichey connecting directly to STNM emergency trauma wing."
        }
    )

gmch = EmergencyFacility.objects.filter(name__icontains="Gauhati Medical").first()
if gmch:
    SafeEvacuationRoute.objects.update_or_create(
        name="Kamakhya Foothills -> GMCH Central Emergency Route",
        defaults={
            "state": "Assam",
            "district": "Kamrup Metropolitan",
            "origin_area": "Kamakhya West Slope Fracture Catchment",
            "destination_facility": gmch,
            "distance_km": 11.2,
            "estimated_time_mins": 22,
            "safety_status": "RECOMMENDED_SAFE",
            "hazard_road_status": "CAUTION_HEAVY_RUNOFF",
            "safe_waypoints_json": json.dumps([
                [26.1640, 91.7050],
                [26.1680, 91.7250],
                [26.1620, 91.7500],
                [26.1558, 91.7682]
            ]),
            "hazard_waypoints_json": json.dumps([
                [26.1640, 91.7050],
                [26.1590, 91.7100],
                [26.1530, 91.7200]
            ]),
            "advisory_notes": "Lower hill cut road experiencing surface washout. Diversion route via AT Road to GMCH elevated expressway is fully open and guarded by traffic police."
        }
    )

rims = EmergencyFacility.objects.filter(name__icontains="RIMS").first()
if rims:
    SafeEvacuationRoute.objects.update_or_create(
        name="Tupul Railway Corridor -> RIMS Imphal Trauma Route",
        defaults={
            "state": "Manipur",
            "district": "Noney",
            "origin_area": "Tupul Yard Vulnerable Cut Slopes",
            "destination_facility": rims,
            "distance_km": 42.0,
            "estimated_time_mins": 65,
            "safety_status": "RECOMMENDED_SAFE",
            "hazard_road_status": "BLOCKED_HIGH_RISK",
            "safe_waypoints_json": json.dumps([
                [24.7920, 93.6800],
                [24.8050, 93.7500],
                [24.8120, 93.8400],
                [24.8190, 93.9210]
            ]),
            "hazard_waypoints_json": json.dumps([
                [24.7920, 93.6800],
                [24.7800, 93.7000],
                [24.7700, 93.7200]
            ]),
            "advisory_notes": "NH-37 riverbank section saturated. Evacuate along northern ridge spur to Imphal via Lamphelpat corridor."
        }
    )

print(f"Loaded {SafeEvacuationRoute.objects.count()} Safe Evacuation Routes.")

# Seed Citizen Reports
print("Seeding Citizen Reports with AI Vision...")
citizen_reports_data = [
    {
        "reporter_name": "Tenzing Lepcha (Gram Panchayat Head)",
        "reporter_phone": "+91 98320 44120",
        "incident_type": "ROAD_CRACK",
        "location_name": "Gangtok-Nathula Highway KM 14",
        "district": "East Sikkim",
        "state": "Sikkim",
        "latitude": 27.3480,
        "longitude": 88.6420,
        "description": "Continuous crack extending 35 meters across NH-310 pavement. Width is approx 10cm and expanding after continuous overnight downpour.",
        "photo_url": "tension_crack_road.jpg",
        "ai_vision_findings": "Transverse tension crack detected with asphalt separation (width: ~12cm). Differential vertical displacement indicates active crown scarp propagation.",
        "ai_risk_score": 88.4,
        "ai_severity": "CRITICAL",
        "ai_confidence": 95.8,
        "status": "VERIFIED_DISPATCHED",
        "reviewed_by": "SEOC District Control Room Gangtok"
    },
    {
        "reporter_name": "Bipul Kalita (Highway Commuter)",
        "reporter_phone": "+91 94350 11890",
        "incident_type": "WATER_SEEPAGE",
        "location_name": "Kamakhya West Slope Access Road",
        "district": "Kamrup Metropolitan",
        "state": "Assam",
        "latitude": 26.1660,
        "longitude": 91.7080,
        "description": "Muddy red water gushing out from the base of the retaining wall. Small loose stones tumbling onto the pedestrian track.",
        "photo_url": "water_seepage_slope.jpg",
        "ai_vision_findings": "High-volume piping seepage identified at slope toe. Effluent turbidity indicates severe internal soil wash and loss of matrix shear resistance.",
        "ai_risk_score": 79.5,
        "ai_severity": "HIGH",
        "ai_confidence": 92.1,
        "status": "VERIFIED_DISPATCHED",
        "reviewed_by": "Assam SDRF Field Unit 1"
    },
    {
        "reporter_name": "Khrawbok Mawlong (Local Farmer)",
        "reporter_phone": "+91 87875 33201",
        "incident_type": "SOIL_SLUMP",
        "location_name": "Nohkalikai Ridge Terrace",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "latitude": 25.2750,
        "longitude": 91.6880,
        "description": "Ground dropped down by nearly 2 feet over a 50-meter arc above the village cultivation terraces. Trees are leaning downwards.",
        "photo_url": "rotational_slump_terrace.jpg",
        "ai_vision_findings": "Classic rotational slump scarp with backward-tilted bench. J-shaped tree deformation confirms active progressive mass creeping.",
        "ai_risk_score": 93.2,
        "ai_severity": "CRITICAL",
        "ai_confidence": 97.0,
        "status": "VERIFIED_DISPATCHED",
        "reviewed_by": "Meghalaya Disaster Management Authority"
    },
    {
        "reporter_name": "Sentitemjen Jamir (Student)",
        "reporter_phone": "+91 70051 88432",
        "incident_type": "ROCKFALL",
        "location_name": "Kohima-Dimapur Bypass KM 8",
        "district": "Kohima",
        "state": "Nagaland",
        "latitude": 25.6820,
        "longitude": 94.0950,
        "description": "Multiple boulders rolled down the shale cliff during morning thunder shower. Wire mesh retention is bulging heavily.",
        "photo_url": "rockfall_boulders.jpg",
        "ai_vision_findings": "Detached jointed rock blocks (1.2m diameter) resting on road shoulder. Retaining mesh under high tensile strain near failure limit.",
        "ai_risk_score": 82.0,
        "ai_severity": "HIGH",
        "ai_confidence": 93.4,
        "status": "PENDING_REVIEW",
        "reviewed_by": None
    }
]

for rep in citizen_reports_data:
    CitizenReport.objects.update_or_create(
        location_name=rep["location_name"],
        incident_type=rep["incident_type"],
        defaults=rep
    )

print(f"Loaded {CitizenReport.objects.count()} Citizen Ground Reports.")
print("Seed completed successfully!")
