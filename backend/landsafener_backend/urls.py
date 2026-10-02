"""
URL configuration for LANDSAFE-NER backend project.
"""

from django.contrib import admin
from django.urls import path, re_path, include
from .views import serve_react_app

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'^(?P<path>.*)$', serve_react_app, name='react-spa'),
]
