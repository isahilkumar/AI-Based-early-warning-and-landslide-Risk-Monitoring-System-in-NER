"""
URL configuration for LANDSAFE-NER backend project.
"""

from django.contrib import admin
from django.urls import path, include
from api.views import ApiRootIndexView

urlpatterns = [
    path('', ApiRootIndexView.as_view(), name='root-portal'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
