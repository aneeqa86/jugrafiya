from django.db import models
from django.contrib.gis.db import models as gis_models

# Model for representing provinces in Pakistan
class Pakistan(models.Model):
    gid = models.AutoField(primary_key=True)
    province = models.CharField(max_length=255)
    area_1 = models.CharField(max_length=255, null=True, blank=True)
    geom = gis_models.MultiPolygonField()

    def __str__(self):
        return self.province

    class Meta:
        db_table = 'pakistan'  

# Model for representing provinces
class Province(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# Model for representing schools
class School(models.Model):
    name = models.CharField(max_length=100)
    location = gis_models.PointField()
    address = models.TextField()
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='schools', db_column='province_gid')

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'school'