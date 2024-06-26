# Generated by Django 5.0.3 on 2024-04-04 11:55

import django.contrib.gis.db.models.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Pakistan',
            fields=[
                ('gid', models.AutoField(primary_key=True, serialize=False)),
                ('province', models.CharField(max_length=255)),
                ('area_1', models.CharField(blank=True, max_length=255, null=True)),
                ('geom', django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326)),
            ],
            options={
                'db_table': 'pakistan',
            },
        ),
        migrations.CreateModel(
            name='Province',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='School',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('location', django.contrib.gis.db.models.fields.PointField(srid=4326)),
                ('address', models.TextField()),
                ('province', models.ForeignKey(db_column='province_gid', on_delete=django.db.models.deletion.CASCADE, related_name='schools', to='api.province')),
            ],
            options={
                'db_table': 'school',
            },
        ),
    ]
