from django.urls import path
from .views import MoveOutCheckView

urlpatterns = [
    path("check/", MoveOutCheckView.as_view(), name="moveout-check"),
]