from django.urls import path
from .views import SalaryCalculateView

urlpatterns = [
    path(
        "calculate/",
        SalaryCalculateView.as_view(),
        name="salary-calculate",
    ),
]