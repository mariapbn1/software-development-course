from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation['brand'] = instance.brand.name if instance.brand else None
        representation['color'] = instance.color.name if instance.color else None
        representation['operating_system'] = instance.operating_system.name if instance.operating_system else None
        representation[
            'max_supported_network'
        ] = instance.max_supported_network.name if instance.max_supported_network else None

        return representation
