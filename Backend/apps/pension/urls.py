from django.urls import path
from .views import PensionProjectionView

app_name = "pension"

urlpatterns = [
    path("project/", PensionProjectionView.as_view(), name="project"),
]
