from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import (
    Product,
    Brand,
    Color,
    MaxSupportNetwork,
    OperatingSystem
)

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


class ProductFilterOptionsView(APIView):

    def get(self, request):

        data = {

            # ---------- RELATIONS ----------
            "brands": list(
                Brand.objects.values("id", "name")
            ),

            "colors": list(
                Color.objects.values("id", "name")
            ),

            "networks": list(
                MaxSupportNetwork.objects.values("id", "name")
            ),

            "operating_systems": list(
                OperatingSystem.objects.values("id", "name")
            ),

            # ---------- DISCRETE NUMERIC ----------
            "ram": list(
                Product.objects.values_list(
                    "ram", flat=True
                ).distinct().order_by("ram")
            ),

            "storage": list(
                Product.objects.values_list(
                    "storage", flat=True
                ).distinct().order_by("storage")
            ),

            "max_battery": list(
                Product.objects.values_list(
                    "max_battery", flat=True
                ).distinct().order_by("max_battery")
            ),

            "main_camera_res": list(
                Product.objects.values_list(
                    "main_camera_res", flat=True
                ).distinct().order_by("main_camera_res")
            ),

            "selfie_camera_res": list(
                Product.objects.values_list(
                    "selfie_camera_res", flat=True
                ).distinct().order_by("selfie_camera_res")
            ),

            # ---------- BOOLEAN ----------
            "has_nfc": [True, False],
            "has_headphone_jack": [True, False],

            # ---------- RELEASE YEARS ----------
            "release_years": [
                d.year for d in
                Product.objects.dates(
                    "release_date",
                    "year"
                )
            ]
        }

        return Response(data)