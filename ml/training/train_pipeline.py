"""
LANDSAFE-NER Machine Learning Pipeline
Trains and compares:
1. Logistic Regression (Baseline)
2. Random Forest Classifier
3. Gradient Boosting Classifier
4. XGBoost Classifier

Generates performance metrics: Accuracy, Precision, Recall, F1-Score, ROC-AUC score,
Confusion Matrix, Feature Importances, and serializes the best performing model.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, 'dataset')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

FEATURE_COLUMNS = [
    'rainfall_24h',
    'rainfall_72h',
    'slope',
    'elevation',
    'soil_moisture',
    'ndvi',
    'aspect',
    'terrain_ruggedness',
    'distance_to_fault_km',
    'distance_to_road_cut_m',
    'historical_landslide_count',
    'temperature',
    'humidity',
    'land_cover_code',  # 0: Forest, 1: Shrubland, 2: Agriculture, 3: Urban, 4: Barren/Excavated
    'geology_code'      # 0: Alluvium, 1: Quartzite, 2: Gneiss, 3: Limestone, 4: Sandstone/Shale, 5: Schist/Phyllite (weakest)
]

LAND_COVER_MAP = {
    0: 'Dense Forest',
    1: 'Shrubland / Degraded Forest',
    2: 'Terraced Agriculture',
    3: 'Built-up / Urban Settlement',
    4: 'Barren / Slope Cut / Excavation'
}

GEOLOGY_MAP = {
    0: 'Alluvium (Plains)',
    1: 'Massive Quartzite (Stable)',
    2: 'Granite Gneiss (Moderate)',
    3: 'Limestone / Karst',
    4: 'Weathered Sandstone & Shale',
    5: 'Foliated Schist / Weak Phyllite'
}

# NER Districts reference data with coordinates and baseline terrain
NER_LOCATIONS = [
    # Sikkim
    {"id": "sk_01", "name": "Gangtok", "district": "East Sikkim", "state": "Sikkim", "lat": 27.3389, "lng": 88.6065, "elevation": 1650, "slope": 34, "fault_km": 4.2, "road_cut_m": 45, "geology": 5, "land_cover": 3},
    {"id": "sk_02", "name": "Mangan (Dikchu)", "district": "North Sikkim", "state": "Sikkim", "lat": 27.5028, "lng": 88.5284, "elevation": 1310, "slope": 42, "fault_km": 1.8, "road_cut_m": 25, "geology": 5, "land_cover": 1},
    {"id": "sk_03", "name": "Gyalshing", "district": "West Sikkim", "state": "Sikkim", "lat": 27.2833, "lng": 88.2333, "elevation": 1720, "slope": 31, "fault_km": 6.5, "road_cut_m": 80, "geology": 4, "land_cover": 0},
    {"id": "sk_04", "name": "Namchi", "district": "South Sikkim", "state": "Sikkim", "lat": 27.1667, "lng": 88.3500, "elevation": 1315, "slope": 28, "fault_km": 5.1, "road_cut_m": 60, "geology": 4, "land_cover": 2},
    {"id": "sk_05", "name": "Pakyong", "district": "Pakyong", "state": "Sikkim", "lat": 27.2372, "lng": 88.5894, "elevation": 1330, "slope": 35, "fault_km": 3.9, "road_cut_m": 30, "geology": 5, "land_cover": 4},
    {"id": "sk_06", "name": "Singtam-Rangpo Corridor", "district": "East Sikkim", "state": "Sikkim", "lat": 27.2341, "lng": 88.4975, "elevation": 420, "slope": 39, "fault_km": 2.1, "road_cut_m": 15, "geology": 5, "land_cover": 4},

    # Meghalaya
    {"id": "ml_01", "name": "Shillong (Upper)", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.5788, "lng": 91.8933, "elevation": 1525, "slope": 26, "fault_km": 8.0, "road_cut_m": 110, "geology": 2, "land_cover": 3},
    {"id": "ml_02", "name": "Cherrapunji (Sohra)", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.2700, "lng": 91.7300, "elevation": 1430, "slope": 38, "fault_km": 4.5, "road_cut_m": 40, "geology": 4, "land_cover": 1},
    {"id": "ml_03", "name": "Mawsynram", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.2974, "lng": 91.5833, "elevation": 1400, "slope": 36, "fault_km": 5.0, "road_cut_m": 50, "geology": 4, "land_cover": 1},
    {"id": "ml_04", "name": "Tura Hills", "district": "West Garo Hills", "state": "Meghalaya", "lat": 25.5138, "lng": 90.2201, "elevation": 650, "slope": 32, "fault_km": 9.2, "road_cut_m": 75, "geology": 2, "land_cover": 0},
    {"id": "ml_05", "name": "Nongpoh Valley", "district": "Ri-Bhoi", "state": "Meghalaya", "lat": 25.9000, "lng": 91.8833, "elevation": 485, "slope": 22, "fault_km": 11.0, "road_cut_m": 120, "geology": 2, "land_cover": 2},
    {"id": "ml_06", "name": "Jowai Escarpment", "district": "West Jaintia Hills", "state": "Meghalaya", "lat": 25.4500, "lng": 92.2000, "elevation": 1380, "slope": 30, "fault_km": 7.4, "road_cut_m": 65, "geology": 4, "land_cover": 1},

    # Assam
    {"id": "as_01", "name": "Haflong (Dima Hasao)", "district": "Dima Hasao", "state": "Assam", "lat": 25.1764, "lng": 93.0169, "elevation": 680, "slope": 37, "fault_km": 3.1, "road_cut_m": 20, "geology": 4, "land_cover": 4},
    {"id": "as_02", "name": "Guwahati (Kamakhya & Kharghuli)", "district": "Kamrup Metro", "state": "Assam", "lat": 26.1667, "lng": 91.7100, "elevation": 180, "slope": 29, "fault_km": 6.8, "road_cut_m": 35, "geology": 2, "land_cover": 3},
    {"id": "as_03", "name": "Diphu Hills", "district": "Karbi Anglong", "state": "Assam", "lat": 25.8427, "lng": 93.4290, "elevation": 280, "slope": 24, "fault_km": 8.5, "road_cut_m": 90, "geology": 2, "land_cover": 2},
    {"id": "as_04", "name": "Silchar Bypass Slopes", "district": "Cachar", "state": "Assam", "lat": 24.8333, "lng": 92.7789, "elevation": 120, "slope": 21, "fault_km": 12.0, "road_cut_m": 100, "geology": 0, "land_cover": 2},

    # Arunachal Pradesh
    {"id": "ar_01", "name": "Itanagar (Gohpur Hill)", "district": "Papum Pare", "state": "Arunachal Pradesh", "lat": 27.0844, "lng": 93.6053, "elevation": 440, "slope": 33, "fault_km": 4.8, "road_cut_m": 40, "geology": 4, "land_cover": 3},
    {"id": "ar_02", "name": "Tawang Pass Area", "district": "Tawang", "state": "Arunachal Pradesh", "lat": 27.5861, "lng": 91.8653, "elevation": 3048, "slope": 44, "fault_km": 2.5, "road_cut_m": 30, "geology": 5, "land_cover": 1},
    {"id": "ar_03", "name": "Bomdila Range", "district": "West Kameng", "state": "Arunachal Pradesh", "lat": 27.2644, "lng": 92.4222, "elevation": 2415, "slope": 40, "fault_km": 3.7, "road_cut_m": 45, "geology": 5, "land_cover": 0},
    {"id": "ar_04", "name": "Pasighat Foothills", "district": "East Siang", "state": "Arunachal Pradesh", "lat": 28.0667, "lng": 95.3333, "elevation": 155, "slope": 25, "fault_km": 7.1, "road_cut_m": 85, "geology": 0, "land_cover": 1},
    {"id": "ar_05", "name": "Bhalukpong Gorge", "district": "West Kameng", "state": "Arunachal Pradesh", "lat": 27.0167, "lng": 92.6500, "elevation": 213, "slope": 46, "fault_km": 1.9, "road_cut_m": 10, "geology": 4, "land_cover": 4},

    # Nagaland
    {"id": "nl_01", "name": "Kohima (Phesama/NH-29)", "district": "Kohima", "state": "Nagaland", "lat": 25.6751, "lng": 94.1086, "elevation": 1444, "slope": 36, "fault_km": 2.9, "road_cut_m": 25, "geology": 5, "land_cover": 3},
    {"id": "nl_02", "name": "Mokokchung Ridge", "district": "Mokokchung", "state": "Nagaland", "lat": 26.3245, "lng": 94.5160, "elevation": 1325, "slope": 32, "fault_km": 5.4, "road_cut_m": 60, "geology": 4, "land_cover": 0},
    {"id": "nl_03", "name": "Phek Hillside", "district": "Phek", "state": "Nagaland", "lat": 25.6833, "lng": 94.4833, "elevation": 1580, "slope": 38, "fault_km": 3.8, "road_cut_m": 50, "geology": 5, "land_cover": 2},
    {"id": "nl_04", "name": "Wokha (Doyang Valley)", "district": "Wokha", "state": "Nagaland", "lat": 26.1000, "lng": 94.2667, "elevation": 1313, "slope": 34, "fault_km": 4.9, "road_cut_m": 55, "geology": 4, "land_cover": 1},

    # Manipur
    {"id": "mn_01", "name": "Tamenglong Slopes", "district": "Tamenglong", "state": "Manipur", "lat": 24.9833, "lng": 93.4833, "elevation": 1260, "slope": 41, "fault_km": 2.2, "road_cut_m": 30, "geology": 5, "land_cover": 1},
    {"id": "mn_02", "name": "Noney (Tupul Railway Site)", "district": "Noney", "state": "Manipur", "lat": 24.7833, "lng": 93.6333, "elevation": 820, "slope": 43, "fault_km": 1.7, "road_cut_m": 15, "geology": 5, "land_cover": 4},
    {"id": "mn_03", "name": "Senapati Highway", "district": "Senapati", "state": "Manipur", "lat": 25.2667, "lng": 94.0167, "elevation": 1410, "slope": 35, "fault_km": 4.1, "road_cut_m": 35, "geology": 4, "land_cover": 2},
    {"id": "mn_04", "name": "Ukhrul Escarpment", "district": "Ukhrul", "state": "Manipur", "lat": 25.1167, "lng": 94.3667, "elevation": 2020, "slope": 37, "fault_km": 3.6, "road_cut_m": 45, "geology": 4, "land_cover": 0},
    {"id": "mn_05", "name": "Imphal Basin", "district": "Imphal West", "state": "Manipur", "lat": 24.8170, "lng": 93.9368, "elevation": 786, "slope": 12, "fault_km": 15.0, "road_cut_m": 200, "geology": 0, "land_cover": 3},

    # Mizoram
    {"id": "mz_01", "name": "Aizawl (Ramhlun / Hunthar)", "district": "Aizawl", "state": "Mizoram", "lat": 23.7271, "lng": 92.7176, "elevation": 1132, "slope": 39, "fault_km": 2.8, "road_cut_m": 20, "geology": 4, "land_cover": 3},
    {"id": "mz_02", "name": "Lunglei Ridge", "district": "Lunglei", "state": "Mizoram", "lat": 22.8833, "lng": 92.7333, "elevation": 722, "slope": 35, "fault_km": 4.5, "road_cut_m": 40, "geology": 4, "land_cover": 1},
    {"id": "mz_03", "name": "Champhai Border Slopes", "district": "Champhai", "state": "Mizoram", "lat": 23.4757, "lng": 93.3275, "elevation": 1360, "slope": 31, "fault_km": 5.8, "road_cut_m": 60, "geology": 4, "land_cover": 2},
    {"id": "mz_04", "name": "Kolasib Highway Section", "district": "Kolasib", "state": "Mizoram", "lat": 24.2300, "lng": 92.6800, "elevation": 590, "slope": 36, "fault_km": 3.5, "road_cut_m": 25, "geology": 4, "land_cover": 4},

    # Tripura
    {"id": "tr_01", "name": "Jampui Hills", "district": "North Tripura", "state": "Tripura", "lat": 23.9833, "lng": 92.2833, "elevation": 930, "slope": 30, "fault_km": 7.2, "road_cut_m": 70, "geology": 4, "land_cover": 0},
    {"id": "tr_02", "name": "Longtharai Valley", "district": "Dhalai", "state": "Tripura", "lat": 23.8500, "lng": 91.9500, "elevation": 320, "slope": 25, "fault_km": 9.0, "road_cut_m": 90, "geology": 4, "land_cover": 1},
    {"id": "tr_03", "name": "Agartala Urban Foothills", "district": "West Tripura", "state": "Tripura", "lat": 23.8315, "lng": 91.2868, "elevation": 45, "slope": 10, "fault_km": 18.0, "road_cut_m": 250, "geology": 0, "land_cover": 3}
]


def generate_synthetic_dataset(num_samples=3200, random_seed=42):
    """
    Generates a realistic geospatially & meteorologically calibrated dataset
    representative of the geological and monsoonal terrain in North Eastern India.
    """
    np.random.seed(random_seed)
    records = []

    for _ in range(num_samples):
        # Pick a base NER location template for realistic regional correlation
        loc = np.random.choice(NER_LOCATIONS)

        # Perturbations
        slope = float(np.clip(loc['slope'] + np.random.normal(0, 6.5), 5.0, 58.0))
        elevation = float(np.clip(loc['elevation'] + np.random.normal(0, 180), 50.0, 3800.0))
        fault_km = float(np.clip(loc['fault_km'] + np.random.normal(0, 1.2), 0.5, 30.0))
        road_cut_m = float(np.clip(loc['road_cut_m'] + np.random.normal(0, 15), 5.0, 400.0))
        geology_code = int(loc['geology']) if np.random.rand() > 0.15 else int(np.random.choice(list(GEOLOGY_MAP.keys())))
        land_cover_code = int(loc['land_cover']) if np.random.rand() > 0.20 else int(np.random.choice(list(LAND_COVER_MAP.keys())))

        # Monsoonal rainfall distributions (Dry spells vs Heavy monsoon downpours vs Cyclonic events)
        weather_regime = np.random.choice(['light', 'moderate', 'heavy_monsoon', 'extreme_cloudburst'], p=[0.35, 0.35, 0.22, 0.08])

        if weather_regime == 'light':
            rainfall_24h = float(np.random.exponential(scale=18))
            soil_moisture = float(np.clip(np.random.normal(35, 10), 10, 60))
        elif weather_regime == 'moderate':
            rainfall_24h = float(np.random.normal(55, 20))
            soil_moisture = float(np.clip(np.random.normal(58, 8), 35, 80))
        elif weather_regime == 'heavy_monsoon':
            rainfall_24h = float(np.random.normal(145, 35))
            soil_moisture = float(np.clip(np.random.normal(82, 6), 65, 98))
        else: # extreme
            rainfall_24h = float(np.random.normal(230, 45))
            soil_moisture = float(np.clip(np.random.normal(92, 4), 80, 100))

        rainfall_24h = float(np.clip(rainfall_24h, 0.0, 380.0))
        rainfall_72h = float(rainfall_24h * np.random.uniform(1.8, 3.2) + np.random.normal(20, 10))
        rainfall_72h = float(np.clip(rainfall_72h, rainfall_24h, 750.0))

        # NDVI (Vegetation index) - lower for barren/urban/road cuts, higher for dense forest
        if land_cover_code == 0:  # Forest
            ndvi = float(np.clip(np.random.normal(0.72, 0.08), 0.50, 0.88))
        elif land_cover_code == 1:  # Shrubland
            ndvi = float(np.clip(np.random.normal(0.48, 0.09), 0.30, 0.65))
        elif land_cover_code == 2:  # Agriculture
            ndvi = float(np.clip(np.random.normal(0.42, 0.10), 0.25, 0.60))
        elif land_cover_code == 3:  # Urban
            ndvi = float(np.clip(np.random.normal(0.18, 0.08), 0.05, 0.35))
        else:  # Barren / Cut slope
            ndvi = float(np.clip(np.random.normal(0.08, 0.06), -0.05, 0.22))

        aspect = float(np.random.uniform(0, 360))
        terrain_ruggedness = float(np.clip(slope * 1.8 + np.random.normal(15, 8), 10, 120))
        temperature = float(np.clip(28.0 - (elevation / 1000.0) * 5.5 + np.random.normal(0, 2.5), 4.0, 38.0))
        humidity = float(np.clip(45.0 + (soil_moisture * 0.45) + (rainfall_24h * 0.1) + np.random.normal(0, 5), 35.0, 100.0))
        historical_landslide_count = int(np.random.poisson(lam=1.2 if slope > 30 else 0.3))

        # Geotechnical Susceptibility Scoring (Physics-guided domain modeling)
        # Factor 1: Slope factor (exponential increase past 28-30 degrees)
        f_slope = 1.0 / (1.0 + np.exp(-(slope - 33.0) / 4.8))
        # Factor 2: Rainfall saturation trigger (24h > 100mm or 72h > 180mm)
        f_rain = 1.0 / (1.0 + np.exp(-(rainfall_24h - 110.0) / 28.0)) + 0.3 * (1.0 / (1.0 + np.exp(-(rainfall_72h - 220.0) / 50.0)))
        # Factor 3: Soil moisture saturation (> 80% is critical)
        f_moisture = 1.0 / (1.0 + np.exp(-(soil_moisture - 78.0) / 6.5))
        # Factor 4: Vegetation root cohesion (higher NDVI protects slope)
        f_veg = 1.0 - (ndvi * 0.7)
        # Factor 5: Weak geology (Schist/Phyllite = 5 has highest failure rate)
        f_geol = (geology_code / 5.0) * 0.85
        # Factor 6: Anthropogenic slope cut (road cuts < 40m destabilize toe of slope)
        f_road = np.exp(-road_cut_m / 60.0)
        # Factor 7: Seismic fault proximity (< 5km increases fragility)
        f_fault = np.exp(-fault_km / 6.0)

        # Composite logit
        latent_logit = (
            2.2 * f_slope +
            2.5 * f_rain +
            1.8 * f_moisture +
            1.1 * f_veg +
            1.3 * f_geol +
            1.0 * f_road +
            0.7 * f_fault +
            0.15 * historical_landslide_count -
            4.2 +
            np.random.normal(0, 0.35)
        )

        probability = 1.0 / (1.0 + np.exp(-latent_logit))
        probability = float(np.clip(probability, 0.01, 0.99))
        landslide_occurred = int(probability >= 0.50)

        records.append({
            'rainfall_24h': round(rainfall_24h, 1),
            'rainfall_72h': round(rainfall_72h, 1),
            'slope': round(slope, 1),
            'elevation': round(elevation, 1),
            'soil_moisture': round(soil_moisture, 1),
            'ndvi': round(ndvi, 3),
            'aspect': round(aspect, 1),
            'terrain_ruggedness': round(terrain_ruggedness, 1),
            'distance_to_fault_km': round(fault_km, 2),
            'distance_to_road_cut_m': round(road_cut_m, 1),
            'historical_landslide_count': historical_landslide_count,
            'temperature': round(temperature, 1),
            'humidity': round(humidity, 1),
            'land_cover_code': land_cover_code,
            'geology_code': geology_code,
            'risk_probability': round(probability, 4),
            'landslide_occurred': landslide_occurred
        })

    df = pd.DataFrame(records)
    csv_path = os.path.join(DATASET_DIR, 'ner_landslide_historical_dataset.csv')
    df.to_csv(csv_path, index=False)
    print(f"Generated synthetic dataset with {len(df)} samples saved to {csv_path}")

    # Also save NER locations registry
    loc_json_path = os.path.join(DATASET_DIR, 'ner_locations_registry.json')
    with open(loc_json_path, 'w', encoding='utf-8') as f:
        json.dump(NER_LOCATIONS, f, indent=2)
    print(f"Saved {len(NER_LOCATIONS)} NER locations registry to {loc_json_path}")

    return df


def train_and_benchmark_models(df):
    X = df[FEATURE_COLUMNS]
    y = df['landslide_occurred']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Candidate Models
    models = {
        "Logistic Regression": {
            "model": LogisticRegression(max_iter=1000, random_state=42),
            "use_scaled": True
        },
        "Random Forest": {
            "model": RandomForestClassifier(n_estimators=150, max_depth=12, min_samples_split=4, random_state=42),
            "use_scaled": False
        },
        "Gradient Boosting": {
            "model": GradientBoostingClassifier(n_estimators=150, learning_rate=0.08, max_depth=5, random_state=42),
            "use_scaled": False
        },
        "XGBoost": {
            "model": XGBClassifier(n_estimators=150, learning_rate=0.08, max_depth=5, eval_metric='logloss', random_state=42),
            "use_scaled": False
        }
    }

    results = {}
    best_f1 = -1.0
    best_model_name = None
    best_model_obj = None

    for name, config in models.items():
        clf = config["model"]
        X_tr = X_train_scaled if config["use_scaled"] else X_train
        X_te = X_test_scaled if config["use_scaled"] else X_test

        clf.fit(X_tr, y_train)
        y_pred = clf.predict(X_te)
        y_prob = clf.predict_proba(X_te)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()

        # Compute ROC curve sample points for frontend visualization
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        # downsample curve points to ~20 points for fast json
        indices = np.linspace(0, len(fpr) - 1, min(25, len(fpr))).astype(int)
        roc_points = [{"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)} for i in indices]

        # Extract feature importances if available
        feature_importances = {}
        if hasattr(clf, 'feature_importances_'):
            importances = clf.feature_importances_
            for feat, imp in zip(FEATURE_COLUMNS, importances):
                feature_importances[feat] = round(float(imp), 4)
        elif hasattr(clf, 'coef_'):
            coefs = np.abs(clf.coef_[0])
            coefs_norm = coefs / np.sum(coefs)
            for feat, imp in zip(FEATURE_COLUMNS, coefs_norm):
                feature_importances[feat] = round(float(imp), 4)

        # Sort feature importances
        sorted_fi = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))

        results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "confusion_matrix": cm,
            "roc_curve": roc_points,
            "feature_importances": sorted_fi,
            "test_samples": len(y_test)
        }

        print(f"[{name}] Acc: {acc:.4f} | Prec: {prec:.4f} | Rec: {rec:.4f} | F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = clf

    print(f"\n>> Best Model Selected: {best_model_name} (F1 Score: {best_f1:.4f})")

    # Serialize best model, scaler, metadata
    joblib.dump(best_model_obj, os.path.join(MODELS_DIR, 'landslide_best_model.joblib'))
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.joblib'))

    metadata = {
        "best_model_name": best_model_name,
        "best_f1_score": round(best_f1, 4),
        "best_roc_auc": results[best_model_name]["roc_auc"],
        "feature_columns": FEATURE_COLUMNS,
        "land_cover_map": LAND_COVER_MAP,
        "geology_map": GEOLOGY_MAP,
        "total_dataset_size": len(df),
        "training_samples": len(X_train),
        "testing_samples": len(X_test),
        "positive_landslide_ratio": round(float(df['landslide_occurred'].mean()), 4)
    }

    with open(os.path.join(MODELS_DIR, 'model_metadata.json'), 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)

    with open(os.path.join(MODELS_DIR, 'model_comparison_results.json'), 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    print("Model artifacts successfully saved!")
    return best_model_name, results


if __name__ == '__main__':
    df = generate_synthetic_dataset()
    best_name, benchmark_results = train_and_benchmark_models(df)
