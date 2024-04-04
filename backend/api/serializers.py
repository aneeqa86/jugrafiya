from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import Pakistan, School, Province

# Serializer for Pakistan model
class PakistanSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Pakistan
        geo_field = "geom"  
        fields = ('gid','province', 'area_1', 'geom')

# Serializer for School model
class SchoolSerializer(GeoFeatureModelSerializer):
    province = serializers.CharField(write_only=True)

    class Meta:
        model = School
        fields = ['name', 'address', 'province', 'location']
        geo_field = 'location'
 
    def create(self, validated_data):
        province_name = validated_data.pop('province')
        province, _ = Province.objects.get_or_create(name=province_name)
        return School.objects.create(province=province, **validated_data)

# Serializer for Province model
class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = '__all__'