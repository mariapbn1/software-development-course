from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter

from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(ModelViewSet):

    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    filter_backends = [SearchFilter]

    search_fields = [
        "name",
        "synopsis",
        "brand__name",
        "ram",
        "storage"
    ]