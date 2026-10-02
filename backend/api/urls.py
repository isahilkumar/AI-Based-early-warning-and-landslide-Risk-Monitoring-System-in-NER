"""
URL Configuration for LANDSAFE-NER API
"""

from django.urls import path
from .views import (
    ApiRootIndexView,
    HealthCheckView,
    LocationListView,
    LocationDetailView,
    PredictLandslideRiskView,
    ExplainableAiView,
    FutureRiskForecastView,
    CitizenReportsListView,
    CitizenReportVerifyView,
    EmergencyFacilitiesListView,
    SafeRoutesListView,
    HistoricalComparisonView,
    WhatIfSimulatorView,
    AlertNotificationListView,
    AcknowledgeAlertView,
    AnalyticsSummaryView,
    AnalyticsTrendsView,
    HistoricalIncidentsListView,
    ModelBenchmarkView,
    LiveTelemetryRefreshView,
    DisasterResponseTeamsView,
    ExportReportView,
    SatelliteChangeDetectionView
)

urlpatterns = [
    # API Landing Root
    path('', ApiRootIndexView.as_view(), name='api-root'),

    # System Status & Health
    path('health/', HealthCheckView.as_view(), name='system-health'),

    # Locations & GIS Telemetry
    path('locations/', LocationListView.as_view(), name='location-list'),
    path('locations/<int:pk>/', LocationDetailView.as_view(), name='location-detail'),

    # ML Inference, Explainable AI (SHAP) & Future Forecasting
    path('predict/', PredictLandslideRiskView.as_view(), name='predict-risk'),
    path('ml/explain/', ExplainableAiView.as_view(), name='explainable-ai'),
    path('forecast/', FutureRiskForecastView.as_view(), name='future-risk-forecast'),
    path('what-if/', WhatIfSimulatorView.as_view(), name='what-if-simulation'),

    # 🛰️ Earth Observation & Satellite Change Detection
    path('satellite-change-detection/', SatelliteChangeDetectionView.as_view(), name='satellite-change-detection'),

    # Citizen Incident Reporting & AI Computer Vision
    path('citizen-reports/', CitizenReportsListView.as_view(), name='citizen-reports'),
    path('citizen-reports/<int:pk>/verify/', CitizenReportVerifyView.as_view(), name='citizen-report-verify'),

    # Emergency Facilities & Safe Evacuation Routes
    path('emergency-facilities/', EmergencyFacilitiesListView.as_view(), name='emergency-facilities'),
    path('safe-routes/', SafeRoutesListView.as_view(), name='safe-routes'),

    # Early Warning Alerts
    path('alerts/', AlertNotificationListView.as_view(), name='alert-list'),
    path('alerts/<int:pk>/acknowledge/', AcknowledgeAlertView.as_view(), name='alert-acknowledge'),

    # Analytics & Reports
    path('analytics/summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
    path('analytics/trends/', AnalyticsTrendsView.as_view(), name='analytics-trends'),
    path('analytics/historical-comparison/', HistoricalComparisonView.as_view(), name='historical-comparison'),
    path('analytics/historical-incidents/', HistoricalIncidentsListView.as_view(), name='historical-incidents'),

    # AI Model Benchmarks & Comparison
    path('ml/benchmark/', ModelBenchmarkView.as_view(), name='ml-benchmark'),

    # Live Weather Simulator / Ingestion Trigger
    path('telemetry/refresh/', LiveTelemetryRefreshView.as_view(), name='telemetry-refresh'),

    # Response Units
    path('response-teams/', DisasterResponseTeamsView.as_view(), name='response-teams'),

    # Export Disaster Advisory Bulletin
    path('export-report/', ExportReportView.as_view(), name='export-report'),
]

