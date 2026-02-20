from django.contrib import admin
from django.urls import include, path

admin.autodiscover()

urlpatterns = [
    path('users/', include('api.users.urls', namespace='users')),
    path("comments/", include("api.comments.urls", namespace='comments')),
]
