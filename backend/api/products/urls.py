from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ProductFilterOptionsView

app_name = "products"

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='products')

urlpatterns = [
    path("filters/", ProductFilterOptionsView.as_view(),
         name="product-filters"),
    path('', include(router.urls)),
]