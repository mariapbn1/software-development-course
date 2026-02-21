from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    # Use source to return the related object's name instead of its ID
    brand = serializers.CharField(source='brand.name')
    color = serializers.CharField(source='color.name')
    max_supported_network = serializers.CharField(source='max_supported_network.name')
    operating_system = serializers.CharField(source='operating_system.name')

    class Meta:
        model = Product
        fields = "__all__"