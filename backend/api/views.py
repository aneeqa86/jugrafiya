from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.gis.serializers import geojson
from .models import Pakistan, School, Province
from .serializers import PakistanSerializer, SchoolSerializer, ProvinceSerializer 

# View to retrieve provinces in GeoJSON format
@api_view(['GET'])
def provinces_geojson(request):
    provinces = Pakistan.objects.all()  # Query all provinces
    serializer = PakistanSerializer(provinces, many=True)  # Serialize provinces
    return Response(serializer.data)  # Return response with serialized data

# View to handle GET and POST requests for schools
@api_view(['GET', 'POST'])
def schools(request):
    if request.method == 'GET':
        if 'province' in request.GET:  # Check if 'province' parameter is in the request
            province_name = request.GET['province']  # Get province name from request
            province = Province.objects.filter(name__icontains=province_name).first()  # Query province by name
            if province:  
                schools = province.schools.all()  # Query schools related to the province
                serializer = SchoolSerializer(schools, many=True)  
                return Response(serializer.data)  
            return Response({"message": "Province not found"}, status=status.HTTP_404_NOT_FOUND)  
        else:  
            schools = School.objects.all()  
            serializer = SchoolSerializer(schools, many=True)  
            return Response(serializer.data)  
    elif request.method == 'POST':  
        serializer = SchoolSerializer(data=request.data)  
        if serializer.is_valid():  
            serializer.save()  
            return Response(serializer.data, status=status.HTTP_201_CREATED)  
        else:  
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  
