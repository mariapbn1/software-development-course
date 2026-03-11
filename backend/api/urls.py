from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
admin.autodiscover()

urlpatterns = [
    path('users/', include('api.users.urls', namespace='users')),
    path("comments/", include("api.comments.urls", namespace='comments')),
    path("products/", include("api.products.urls", namespace='products')),
    path("roles/", include("api.roles.urls", namespace='roles')),
    path("reports/", include("api.reports.urls", namespace='reports')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
