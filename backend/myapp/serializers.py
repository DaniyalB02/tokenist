# myapp/serializers.py
from rest_framework import serializers
from .models import ListData

class ListDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListData
        fields = '__all__'
