from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import provinces_geojson, schools
from django.shortcuts import redirect

router = DefaultRouter()

urlpatterns = [
    path('api/pakistan/geojson/', provinces_geojson, name='pakistan-geojson'), # Endpoint to retrieve provinces in GeoJSON format  
    path('api/schools/', schools, name='schools'),  # Endpoint for schools API
]