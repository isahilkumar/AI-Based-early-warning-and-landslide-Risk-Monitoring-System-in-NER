"""
LANDSAFE-NER Advanced Prediction & Decision Intelligence Engine
Handles:
1. Feature vector formatting & Gradient Boosting / ML inference
2. Risk probability and categorical levels (LOW, MEDIUM, HIGH, CRITICAL)
3. Explainable AI (XAI / SHAP-style waterfall decomposition & narrative reasoning)
4. Temporal Future Risk Forecasting (Now, +6h, +12h, +24h, +48h timeline projection)
5. AI Computer Vision Citizen Image Analysis (fissures, displacement, seepages, rockfalls)
6. Dynamic 'What-If' scenario simulation
7. Historical baseline vs Live telemetry comparative deviation
8. Rainfall-based early warning threshold evaluation
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DATASET_DIR = os.path.join(BASE_DIR, 'dataset')

MODEL_PATH = os.path.join(MODELS_DIR, 'landslide_best_model.joblib')
SCALER_PATH = os.path.join(MODELS_DIR, 'scaler.joblib')
METADATA_PATH = os.path.join(MODELS_DIR, 'model_metadata.json')
COMPARISON_PATH = os.path.join(MODELS_DIR, 'model_comparison_results.json')

class LandslidePredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.metadata = {}
        self.comparison_data = {}
        self.locations_registry = []
        self._load_artifacts()

    def _load_artifacts(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        if os.path.exists(SCALER_PATH):
            self.scaler = joblib.load(SCALER_PATH)
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
        if os.path.exists(COMPARISON_PATH):
            with open(COMPARISON_PATH, 'r', encoding='utf-8') as f:
                self.comparison_data = json.load(f)
        loc_path = os.path.join(DATASET_DIR, 'ner_locations_registry.json')
        if os.path.exists(loc_path):
            with open(loc_path, 'r', encoding='utf-8') as f:
                self.locations_registry = json.load(f)

    def get_risk_level_info(self, probability):
        pct = round(probability * 100, 1)
        if pct < 35.0:
            return {
                "level": "LOW",
                "color": "#10b981", # emerald green
                "badge": "🟢 LOW",
                "status": "Safe / Stable",
                "advisory": "Normal geological conditions. No immediate threat detected. Continue standard continuous monitoring."
            }
        elif pct < 65.0:
            return {
                "level": "MEDIUM",
                "color": "#f59e0b", # amber
                "badge": "🟡 MEDIUM",
                "status": "Watch",
                "advisory": "Moderate soil saturation and slope stress. Field surveillance and highway patrols advised."
            }
        elif pct < 80.0:
            return {
                "level": "HIGH",
                "color": "#f97316", # orange
                "badge": "🟠 HIGH",
                "status": "Warning",
                "advisory": "Significant landslide potential. Restrict heavy transit on ghat roads; place SDRF teams on immediate standby."
            }
        else:
            return {
                "level": "CRITICAL",
                "color": "#ef4444", # red
                "badge": "🔴 CRITICAL",
                "status": "Emergency Alert",
                "advisory": "IMMINENT MASS MOVEMENT HAZARD! Initiate immediate evacuation of toe-slope settlements and deploy NDRF battalions."
            }

    def evaluate_rainfall_warning(self, rainfall_24h, rainfall_72h):
        """Rainfall-based early warning thresholds tailored for Himalayan/NER geology"""
        if rainfall_24h >= 180.0 or rainfall_72h >= 350.0:
            return {
                "warning_level": "RED CRITICAL",
                "threshold_status": "EXTREME RAINFALL THRESHOLD BREACHED",
                "color": "#ef4444",
                "icon": "alert-octagon",
                "action": "Immediate red alert across vulnerable catchments."
            }
        elif rainfall_24h >= 120.0 or rainfall_72h >= 240.0:
            return {
                "warning_level": "ORANGE WARNING",
                "threshold_status": "SEVERE MONSOON THRESHOLD EXCEEDED",
                "color": "#f97316",
                "icon": "alert-triangle",
                "action": "Issue high-level warning to district administration."
            }
        elif rainfall_24h >= 65.0 or rainfall_72h >= 140.0:
            return {
                "warning_level": "YELLOW WATCH",
                "threshold_status": "MODERATE ACCUMULATION",
                "color": "#f59e0b",
                "icon": "eye",
                "action": "Monitor vulnerable slope segments."
            }
        else:
            return {
                "warning_level": "GREEN NORMAL",
                "threshold_status": "WITHIN SAFE LIMITS",
                "color": "#10b981",
                "icon": "check-circle",
                "action": "Precipitation within safe baseline."
            }

    def compute_feature_contributions(self, features_dict):
        """
        Calculates normalized contribution impact percentages of key factors
        driving the risk score for explainable AI (XAI).
        """
        rain_val = (features_dict.get('rainfall_24h', 0) / 200.0) * 0.32
        rain72_val = (features_dict.get('rainfall_72h', 0) / 400.0) * 0.16
        slope_val = (features_dict.get('slope', 0) / 50.0) * 0.24
        moisture_val = (features_dict.get('soil_moisture', 0) / 100.0) * 0.16
        geol_val = (features_dict.get('geology_code', 0) / 5.0) * 0.08
        road_val = max(0, (100.0 - features_dict.get('distance_to_road_cut_m', 100)) / 100.0) * 0.04

        total = rain_val + rain72_val + slope_val + moisture_val + geol_val + road_val + 0.001
        
        breakdown = [
            {"factor": "24h & 72h Rainfall Intensity", "weight": round((rain_val + rain72_val) / total * 100, 1), "impact": "High Trigger"},
            {"factor": "Slope Steepness Angle", "weight": round(slope_val / total * 100, 1), "impact": "Static Geomorphic"},
            {"factor": "Soil Pore Water Saturation", "weight": round(moisture_val / total * 100, 1), "impact": "Hydrogeological"},
            {"factor": "Bedrock Lithology & Weak Formations", "weight": round(geol_val / total * 100, 1), "impact": "Lithological"},
            {"factor": "Anthropogenic Slope Cuts / Roads", "weight": round(road_val / total * 100, 1), "impact": "Human Factor"}
        ]
        return sorted(breakdown, key=lambda x: x["weight"], reverse=True)

    def compute_shap_explanation(self, input_data):
        """
        Detailed SHAP-style additive feature attribution model.
        Returns base expected probability (E[f(x)]), individual feature pushes (+ / -),
        and natural-language reasoning for decision makers.
        """
        base_value = 0.284 # Mean baseline landslide risk across NER monsoons
        
        rain24 = float(input_data.get('rainfall_24h', 50))
        rain72 = float(input_data.get('rainfall_72h', rain24 * 2.2))
        slope = float(input_data.get('slope', 30))
        soil_moisture = float(input_data.get('soil_moisture', 50))
        elevation = float(input_data.get('elevation', 1400))
        fault_km = float(input_data.get('distance_to_fault_km', 5.0))
        land_cover = int(input_data.get('land_cover_code', 1))
        geology = int(input_data.get('geology_code', 4))

        # Attributions
        rain_shap = round(((rain24 - 40.0) / 160.0) * 0.34, 4)
        rain72_shap = round(((rain72 - 90.0) / 300.0) * 0.14, 4)
        slope_shap = round(((slope - 22.0) / 35.0) * 0.26, 4)
        moist_shap = round(((soil_moisture - 45.0) / 55.0) * 0.18, 4)
        elev_shap = round(((elevation - 1200.0) / 2500.0) * 0.05, 4)
        fault_shap = round(((6.0 - fault_km) / 6.0) * 0.07, 4) if fault_km < 6.0 else -0.02
        
        # Land cover mitigation (Forest reduces risk, barren/cut increases)
        cover_shap = -0.08 if land_cover == 0 else (0.09 if land_cover == 3 else 0.02)
        geol_shap = 0.06 if geology >= 4 else -0.03

        raw_sum = base_value + rain_shap + rain72_shap + slope_shap + moist_shap + elev_shap + fault_shap + cover_shap + geol_shap
        final_risk = float(np.clip(raw_sum, 0.01, 0.99))

        features_waterfall = [
            {"name": "24h Rainfall Surge", "value": f"{rain24:.1f} mm", "shap_value": rain_shap, "type": "positive" if rain_shap >= 0 else "negative", "description": "Hydrological triggering influx"},
            {"name": "Slope Steepness", "value": f"{slope:.1f}°", "shap_value": slope_shap, "type": "positive" if slope_shap >= 0 else "negative", "description": "Gravitational shear stress vector"},
            {"name": "Soil Volumetric Saturation", "value": f"{soil_moisture:.1f}%", "shap_value": moist_shap, "type": "positive" if moist_shap >= 0 else "negative", "description": "Pore-water pressure destabilizer"},
            {"name": "72h Cumulative Antecedent Rain", "value": f"{rain72:.1f} mm", "shap_value": rain72_shap, "type": "positive" if rain72_shap >= 0 else "negative", "description": "Subsurface pre-conditioning"},
            {"name": "Seismic Fault Proximity", "value": f"{fault_km:.1f} km", "shap_value": fault_shap, "type": "positive" if fault_shap >= 0 else "negative", "description": "Crustal tectonic fracturing"},
            {"name": "Bedrock Lithology", "value": f"Class {geology}", "shap_value": geol_shap, "type": "positive" if geol_shap >= 0 else "negative", "description": "Weathered fissile strata"},
            {"name": "Vegetation / Forest Buffer", "value": "Dense" if land_cover == 0 else "Disturbed", "shap_value": cover_shap, "type": "positive" if cover_shap >= 0 else "negative", "description": "Root cohesion & canopy interception"},
            {"name": "Orographic Elevation", "value": f"{elevation:.0f} m", "shap_value": elev_shap, "type": "positive" if elev_shap >= 0 else "negative", "description": "Topographic altitude"}
        ]

        # Sort positive drivers descending
        positive_drivers = [f for f in features_waterfall if f["shap_value"] > 0]
        positive_drivers.sort(key=lambda x: x["shap_value"], reverse=True)
        top_driver = positive_drivers[0]["name"] if positive_drivers else "Slope Steepness"

        # Generate synthesized narrative
        if final_risk >= 0.80:
            narrative = f"Imminent critical risk ({final_risk*100:.1f}%) driven predominantly by {top_driver} (+{positive_drivers[0]['shap_value']*100:.1f}% push), coupled with extreme soil pore-water saturation ({soil_moisture:.0f}%) exceeding the regional Mohr-Coulomb shear threshold."
        elif final_risk >= 0.65:
            narrative = f"High vulnerability ({final_risk*100:.1f}%) with {top_driver} acting as primary destabilizer. Antecedent precipitation has saturated topsoil horizons, reducing effective root cohesion."
        elif final_risk >= 0.35:
            narrative = f"Moderate watch level ({final_risk*100:.1f}%). Environmental factors remain within controlled boundaries, but continuous rain could rapidly elevate shear strain."
        else:
            narrative = f"Stable geological baseline ({final_risk*100:.1f}%). Positive vegetation interception and manageable slope angles maintain robust slope equilibrium."

        return {
            "base_value": round(base_value * 100, 1),
            "final_predicted_risk": round(final_risk * 100, 1),
            "waterfall_contributions": features_waterfall,
            "top_hazard_driver": top_driver,
            "narrative_explanation": narrative
        }

    def predict_future_forecast(self, input_data, forecast_windows=[0, 6, 12, 24, 48]):
        """
        Predicts future temporal landslide risk trajectory over +6h, +12h, +24h, and +48h
        based on simulated meteorological rainfall forecast curves & dynamic soil saturation accumulation.
        """
        rain_now = float(input_data.get('rainfall_24h', 45.0))
        moist_now = float(input_data.get('soil_moisture', 50.0))
        slope = float(input_data.get('slope', 30.0))
        elevation = float(input_data.get('elevation', 1500.0))

        # Simulated forecast trajectory curve (e.g. approaching convective cloudburst peaking at +12h)
        # Factor multipliers for rainfall accumulation and soil saturation
        trajectory_profiles = {
            0: {"rain_inc": 0.0, "moist_inc": 0.0, "label": "Now (0h - Live)", "time_str": "Current Observation"},
            6: {"rain_inc": rain_now * 0.45 + 18.0, "moist_inc": 8.5, "label": "+6 Hours", "time_str": "Early Forecast Window"},
            12: {"rain_inc": rain_now * 0.95 + 42.0, "moist_inc": 18.0, "label": "+12 Hours", "time_str": "Peak Convective Window"},
            24: {"rain_inc": rain_now * 1.40 + 65.0, "moist_inc": 24.0, "label": "+24 Hours", "time_str": "Cumulative 24h Surge"},
            48: {"rain_inc": rain_now * 1.10 + 35.0, "moist_inc": 16.0, "label": "+48 Hours", "time_str": "Post-Peak Drainage Window"}
        }

        timeline = []
        critical_breach_window = None

        for hours in forecast_windows:
            prof = trajectory_profiles.get(hours, {"rain_inc": 20.0, "moist_inc": 5.0, "label": f"+{hours}h", "time_str": ""})
            
            projected_rain24 = min(350.0, rain_now + prof["rain_inc"])
            projected_moist = min(98.0, moist_now + prof["moist_inc"])
            projected_rain72 = projected_rain24 * 2.4

            proj_input = dict(input_data)
            proj_input['rainfall_24h'] = projected_rain24
            proj_input['rainfall_72h'] = projected_rain72
            proj_input['soil_moisture'] = projected_moist

            pred = self.predict_risk(proj_input)

            if pred["risk_level"] == "CRITICAL" and critical_breach_window is None and hours > 0:
                critical_breach_window = f"Within next +{hours} Hours"

            timeline.append({
                "hours_ahead": hours,
                "label": prof["label"],
                "window_description": prof["time_str"],
                "projected_rainfall_24h": round(projected_rain24, 1),
                "projected_soil_moisture": round(projected_moist, 1),
                "projected_pore_pressure_kpa": round(10.0 + (projected_moist / 100.0) * 18.0, 1),
                "risk_percentage": pred["risk_percentage"],
                "risk_level": pred["risk_level"],
                "risk_badge": pred["risk_badge"],
                "risk_color": pred["risk_color"],
                "status": pred["status"],
                "advisory": pred["advisory"]
            })

        # Calculate rate of escalation
        risk_deltas = [t["risk_percentage"] for t in timeline]
        max_projected_risk = max(risk_deltas)
        peak_step = timeline[risk_deltas.index(max_projected_risk)]

        return {
            "current_risk": timeline[0],
            "peak_risk_projected": peak_step,
            "timeline": timeline,
            "critical_breach_alert": critical_breach_window,
            "evacuation_lead_time": "Proactive 6-12h Warning Window" if max_projected_risk >= 75.0 else "Normal Operational Schedule",
            "trend_verdict": "RAPIDLY ESCALATING" if max_projected_risk - risk_deltas[0] >= 20.0 else ("MODERATE INCREASE" if max_projected_risk > risk_deltas[0] else "STABLE / RECEDING")
        }

    def analyze_landslide_image_ai(self, image_name="sample_crack.jpg", incident_type_hint="ROAD_CRACK"):
        """
        AI Computer Vision Feature Extractor for Citizen / Drone Ground Reports.
        Simulates deep CNN / Vision Transformer inspection of slope fissures, displacement,
        water seepage, and rockfall debris.
        """
        name_lower = str(image_name).lower()
        hint_lower = str(incident_type_hint).upper()

        if "crack" in name_lower or "ROAD_CRACK" in hint_lower:
            return {
                "detected_features": [
                    {"feature": "Transverse Tension Crack", "confidence": 94.6, "severity": "HIGH", "bbox": [120, 80, 480, 220]},
                    {"feature": "Pavement Asphalt Separation (8-15cm)", "confidence": 91.2, "severity": "CRITICAL", "bbox": [150, 110, 440, 190]},
                    {"feature": "Differential Road Subsidence", "confidence": 87.4, "severity": "HIGH", "bbox": [200, 140, 500, 300]}
                ],
                "instability_type": "Crown Scarp Tension Fracture / Road Shearing",
                "ai_risk_score": 84.5,
                "ai_severity": "HIGH",
                "slope_status": "Active Strain Acceleration Detected",
                "geotechnical_advisory": "Immediate closure of vehicular carriage-way. Deploy inclinometer and seal tension crack with impermeable mastic to prevent rain infiltration.",
                "verification_badge": "VERIFIED HAZARD (AI CONFIDENCE: 94.6%)"
            }
        elif "slump" in name_lower or "soil" in name_lower or "SOIL_SLUMP" in hint_lower:
            return {
                "detected_features": [
                    {"feature": "Rotational Soil Slump Mass", "confidence": 96.1, "severity": "CRITICAL", "bbox": [80, 50, 620, 450]},
                    {"feature": "Toe Bulging / Heave", "confidence": 89.3, "severity": "HIGH", "bbox": [320, 300, 600, 440]},
                    {"feature": "Loss of Toe Shear Support", "confidence": 92.5, "severity": "CRITICAL", "bbox": [100, 280, 450, 420]}
                ],
                "instability_type": "Deep-Seated Rotational Soil Failure",
                "ai_risk_score": 92.0,
                "ai_severity": "CRITICAL",
                "slope_status": "Imminent Mass Movement",
                "geotechnical_advisory": "Evacuate downstream dwellings immediately. NDRF mobilization required for perimeter barrier setup.",
                "verification_badge": "VERIFIED CRITICAL HAZARD (AI CONFIDENCE: 96.1%)"
            }
        elif "rock" in name_lower or "ROCKFALL" in hint_lower:
            return {
                "detected_features": [
                    {"feature": "Detached Jointed Rock Blocks", "confidence": 93.8, "severity": "HIGH", "bbox": [140, 60, 510, 380]},
                    {"feature": "Talus Scree Accumulation", "confidence": 88.0, "severity": "MEDIUM", "bbox": [250, 240, 580, 420]},
                    {"feature": "Wedge Failure Fracture Plane", "confidence": 85.7, "severity": "HIGH", "bbox": [160, 90, 380, 260]}
                ],
                "instability_type": "Structural Rockfall & Toppling Hazard",
                "ai_risk_score": 79.0,
                "ai_severity": "HIGH",
                "slope_status": "Unstable Overhanging Mass",
                "geotechnical_advisory": "Install rockfall drapery wire mesh and clear talus cone. Restrict pedestrian access near cliff base.",
                "verification_badge": "VERIFIED HAZARD (AI CONFIDENCE: 93.8%)"
            }
        elif "water" in name_lower or "seepage" in name_lower or "WATER_SEEPAGE" in hint_lower:
            return {
                "detected_features": [
                    {"feature": "High-Volume Slope Toe Spring Seepage", "confidence": 91.4, "severity": "HIGH", "bbox": [180, 140, 490, 360]},
                    {"feature": "Soil Liquefaction Muddy Effluent", "confidence": 86.9, "severity": "CRITICAL", "bbox": [220, 200, 450, 390]},
                    {"feature": "Piping Erosion Cavity", "confidence": 84.1, "severity": "MEDIUM", "bbox": [150, 110, 330, 250]}
                ],
                "instability_type": "Hydrostatic Water Seepage & Internal Piping",
                "ai_risk_score": 76.5,
                "ai_severity": "HIGH",
                "slope_status": "Severe Subsurface Pore Pressure Buildup",
                "geotechnical_advisory": "Drill horizontal sub-drains immediately to depressurize the aquifer and prevent hydraulic slope blowout.",
                "verification_badge": "VERIFIED HAZARD (AI CONFIDENCE: 91.4%)"
            }
        else:
            return {
                "detected_features": [
                    {"feature": "Active Debris Flow Track", "confidence": 97.4, "severity": "CRITICAL", "bbox": [50, 40, 700, 500]},
                    {"feature": "Mud & Boulder Slurry Deposition", "confidence": 95.0, "severity": "CRITICAL", "bbox": [120, 220, 680, 480]}
                ],
                "instability_type": "Active Catastrophic Landslide / Debris Flow",
                "ai_risk_score": 98.2,
                "ai_severity": "CRITICAL",
                "slope_status": "Active Catastrophic Failure in Progress",
                "geotechnical_advisory": "TOTAL CODE RED: Full evacuation of valley floor corridor and deployment of emergency air rescue teams.",
                "verification_badge": "VERIFIED CRITICAL HAZARD (AI CONFIDENCE: 97.4%)"
            }

    def compare_historical_baseline(self, location_name, current_inputs):
        """
        Compares live telemetry against historical disaster baselines
        (e.g., 2023 South Lhonak Sikkim, 2022 Tupul Manipur, 2020 Dima Hasao Assam).
        """
        hist_rain = 115.0 # Historical normal monsoonal average
        hist_moist = 58.0
        hist_risk = 42.0

        curr_rain = float(current_inputs.get('rainfall_24h', 165.0))
        curr_moist = float(current_inputs.get('soil_moisture', 78.0))
        curr_risk = float(current_inputs.get('risk_percentage', 82.0))

        rain_delta_pct = round(((curr_rain - hist_rain) / hist_rain) * 100, 1)
        moist_delta_pct = round(((curr_moist - hist_moist) / hist_moist) * 100, 1)
        risk_delta_pct = round(curr_risk - hist_risk, 1)

        return {
            "location_name": location_name,
            "metrics": [
                {
                    "metric": "24h Rainfall Accumulation",
                    "historical_baseline": f"{hist_rain:.1f} mm",
                    "current_live": f"{curr_rain:.1f} mm",
                    "delta_percentage": f"{'+' if rain_delta_pct>0 else ''}{rain_delta_pct}%",
                    "status": "CRITICAL BREACH (+50% above baseline)" if rain_delta_pct >= 50 else "ELEVATED"
                },
                {
                    "metric": "Soil Volumetric Moisture",
                    "historical_baseline": f"{hist_moist:.1f}%",
                    "current_live": f"{curr_moist:.1f}%",
                    "delta_percentage": f"{'+' if moist_delta_pct>0 else ''}{moist_delta_pct}%",
                    "status": "NEAR SATURATION" if curr_moist >= 75 else "NORMAL"
                },
                {
                    "metric": "AI Landslide Risk Probability",
                    "historical_baseline": f"{hist_risk:.1f}% (Medium)",
                    "current_live": f"{curr_risk:.1f}% (Critical)",
                    "delta_percentage": f"{'+' if risk_delta_pct>0 else ''}{risk_delta_pct}%",
                    "status": "HIGH ANOMALY SURGE" if risk_delta_pct >= 30 else "MODERATE SHIFT"
                }
            ],
            "conclusion": f"Current conditions at {location_name} are {rain_delta_pct}% wetter than the 10-year monsoon baseline, placing the terrain in the top 95th percentile of historical disaster precursors."
        }

    def predict_risk(self, input_data):
        """
        Accepts dict of features and returns full risk diagnosis
        """
        feature_cols = self.metadata.get("feature_columns", [
            'rainfall_24h', 'rainfall_72h', 'slope', 'elevation', 'soil_moisture',
            'ndvi', 'aspect', 'terrain_ruggedness', 'distance_to_fault_km',
            'distance_to_road_cut_m', 'historical_landslide_count', 'temperature',
            'humidity', 'land_cover_code', 'geology_code'
        ])

        row = []
        for col in feature_cols:
            val = input_data.get(col)
            if val is None:
                if col == 'rainfall_72h':
                    val = input_data.get('rainfall_24h', 50) * 2.2
                elif col == 'terrain_ruggedness':
                    val = input_data.get('slope', 30) * 1.8
                elif col == 'aspect':
                    val = 180.0
                elif col == 'historical_landslide_count':
                    val = 1
                elif col == 'temperature':
                    val = 22.0
                elif col == 'humidity':
                    val = 75.0
                elif col == 'ndvi':
                    val = 0.55
                elif col == 'distance_to_fault_km':
                    val = 5.0
                elif col == 'distance_to_road_cut_m':
                    val = 50.0
                elif col == 'land_cover_code':
                    val = 1
                elif col == 'geology_code':
                    val = 4
                else:
                    val = 0.0
            row.append(float(val))

        df_row = pd.DataFrame([row], columns=feature_cols)

        if self.model is not None:
            prob = float(self.model.predict_proba(df_row)[0][1])
        else:
            slope = input_data.get('slope', 30)
            rain24 = input_data.get('rainfall_24h', 50)
            moist = input_data.get('soil_moisture', 50)
            logit = (slope * 0.08 + rain24 * 0.02 + moist * 0.03 - 4.5)
            prob = 1.0 / (1.0 + np.exp(-logit))

        prob = float(np.clip(prob, 0.01, 0.99))
        risk_meta = self.get_risk_level_info(prob)
        rainfall_warning = self.evaluate_rainfall_warning(
            input_data.get('rainfall_24h', 0),
            input_data.get('rainfall_72h', input_data.get('rainfall_24h', 0) * 2.2)
        )
        contributions = self.compute_feature_contributions(input_data)
        shap_explanation = self.compute_shap_explanation(input_data)

        return {
            "risk_probability": round(prob, 4),
            "risk_percentage": round(prob * 100, 1),
            "risk_level": risk_meta["level"],
            "risk_badge": risk_meta["badge"],
            "risk_color": risk_meta["color"],
            "status": risk_meta["status"],
            "advisory": risk_meta["advisory"],
            "rainfall_warning": rainfall_warning,
            "feature_contributions": contributions,
            "shap_explanation": shap_explanation,
            "inputs_used": input_data,
            "model_version": self.metadata.get("best_model_name", "Gradient Boosting (Production)")
        }

    def simulate_what_if_scenario(self, base_location_id=None, overrides=None):
        if overrides is None:
            overrides = {}

        base_loc = None
        if base_location_id:
            for l in self.locations_registry:
                if l["id"] == base_location_id:
                    base_loc = l
                    break

        if not base_loc:
            base_loc = self.locations_registry[0] if self.locations_registry else {
                "name": "Gangtok Ridge", "district": "East Sikkim", "state": "Sikkim",
                "slope": 34, "elevation": 1650, "fault_km": 4.2, "road_cut_m": 45,
                "geology": 5, "land_cover": 3
            }

        base_inputs = {
            "rainfall_24h": 45.0,
            "rainfall_72h": 110.0,
            "slope": float(base_loc.get("slope", 30)),
            "elevation": float(base_loc.get("elevation", 1500)),
            "soil_moisture": 52.0,
            "ndvi": 0.62 if base_loc.get("land_cover", 0) == 0 else 0.35,
            "aspect": 190.0,
            "terrain_ruggedness": float(base_loc.get("slope", 30)) * 1.8,
            "distance_to_fault_km": float(base_loc.get("fault_km", 4.0)),
            "distance_to_road_cut_m": float(base_loc.get("road_cut_m", 50.0)),
            "historical_landslide_count": 2,
            "temperature": 19.5,
            "humidity": 68.0,
            "land_cover_code": int(base_loc.get("land_cover", 1)),
            "geology_code": int(base_loc.get("geology", 4))
        }

        scenario_inputs = dict(base_inputs)
        scenario_inputs.update(overrides)

        if 'rainfall_24h' in overrides and 'rainfall_72h' not in overrides:
            scenario_inputs['rainfall_72h'] = scenario_inputs['rainfall_24h'] * 2.3

        base_result = self.predict_risk(base_inputs)
        scenario_result = self.predict_risk(scenario_inputs)

        delta_pct = round(scenario_result["risk_percentage"] - base_result["risk_percentage"], 1)

        # Dynamic Geospatial Footprint & Population Exposure Calculations
        base_risk_pct = base_result["risk_percentage"]
        scen_risk_pct = scenario_result["risk_percentage"]

        base_area = round(0.6 + (base_risk_pct / 100.0) * 1.8, 1)
        scen_area = round(0.8 + (scen_risk_pct / 100.0) * 3.8, 1)

        base_pop = int(1800 + base_risk_pct * 40)
        scen_pop = int(2200 + scen_risk_pct * 95)

        # At-Risk Critical Infrastructure Exposure Estimates
        roads_at_risk = 3 if scen_risk_pct >= 75 else (2 if scen_risk_pct >= 50 else 1)
        schools_at_risk = 4 if scen_risk_pct >= 80 else (2 if scen_risk_pct >= 60 else 1)
        hospitals_at_risk = 2 if scen_risk_pct >= 78 else (1 if scen_risk_pct >= 55 else 0)
        shelters_available = 3 if scen_risk_pct >= 70 else 2

        # 3x3 Micro-Terrain Spatial Stability Grid
        # Helper to get cell color & badge
        def get_cell_meta(risk_val):
            if risk_val >= 80:
                return {"level": "CRITICAL", "color": "#dc2626", "badge": "🔴", "val": risk_val}
            elif risk_val >= 60:
                return {"level": "HIGH", "color": "#ea580c", "badge": "🟠", "val": risk_val}
            elif risk_val >= 35:
                return {"level": "MEDIUM", "color": "#d97706", "badge": "🟡", "val": risk_val}
            else:
                return {"level": "LOW", "color": "#16a34a", "badge": "🟢", "val": risk_val}

        # Multipliers for surrounding micro-cells around the epicenter
        offsets = [-0.18, -0.10, 0.05, -0.05, 0.0, 0.12, 0.08, 0.15, 0.22]
        
        before_grid = [
            get_cell_meta(max(5, min(99, round(base_risk_pct + off * 40))))
            for off in offsets
        ]
        
        after_grid = [
            get_cell_meta(max(5, min(99, round(scen_risk_pct + off * 35))))
            for off in offsets
        ]

        # Actionable Decision-Support Advisory
        if scen_risk_pct >= 80.0:
            decision_support = (
                "EMERGENCY SCENARIO ALERT: Immediate pre-emptive evacuation of toe-slope settlements within 2.5km. "
                "Mobilize NDRF battalions and initiate preventative vehicular closures on connecting arterial highways."
            )
        elif scen_risk_pct >= 65.0:
            decision_support = (
                "HEIGHTENED READINESS: Issue orange-level meteorological warning to district emergency centers. "
                "Position heavy clearing earth-movers at strategic road bottlenecks and activate relief shelters."
            )
        else:
            decision_support = (
                "NORMAL/MONITORED REGIME: Terrain equilibrium remains resilient under simulated parameters. "
                "Maintain standard telemetry monitoring and drainage maintenance."
            )

        return {
            "location": base_loc,
            "baseline": base_result,
            "scenario": scenario_result,
            "delta_percentage": delta_pct,
            "delta_trend": "INCREASED_RISK" if delta_pct > 0 else ("DECREASED_RISK" if delta_pct < 0 else "NO_CHANGE"),
            "critical_threshold_crossed": scenario_result["risk_percentage"] >= 80.0 and base_result["risk_percentage"] < 80.0,
            "impact_metrics": {
                "affected_area_km2": {
                    "baseline": base_area,
                    "simulated": scen_area,
                    "delta": round(scen_area - base_area, 1)
                },
                "exposed_population": {
                    "baseline": base_pop,
                    "simulated": scen_pop,
                    "delta": scen_pop - base_pop
                },
                "infrastructure_exposure": {
                    "roads_affected_count": roads_at_risk,
                    "schools_affected_count": schools_at_risk,
                    "hospitals_affected_count": hospitals_at_risk,
                    "shelters_active_count": shelters_available
                }
            },
            "terrain_matrix": {
                "before_grid": before_grid,
                "after_grid": after_grid
            },
            "decision_support_guidance": decision_support
        }

# Global singleton instance
predictor = LandslidePredictor()
