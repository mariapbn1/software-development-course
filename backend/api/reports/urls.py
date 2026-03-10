from django.urls import path
from .views import DynamicReportView

app_name = "reports"

urlpatterns = [
    path('generate-reports/', DynamicReportView.as_view(), name='dynamic_report'),
]
