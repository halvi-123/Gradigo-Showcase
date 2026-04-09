import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.move_out.models import MoveOutPlan
from apps.move_out.views import MoveOutCheckView
User = get_user_model()

@pytest.fixture
def factory():
    return APIRequestFactory()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="moveoutviews@example.com",
        full_name="Move Out Views User",
        password="securepassword123",
    )

@pytest.fixture
def move_out_plan(user):
    return MoveOutPlan.objects.create(
        user=user,
        target_postcode="GU2 7XH",
        area_name="Guildford",
        area_code="E07000209",
        monthly_income=Decimal("2500.00"),
        monthly_expenses=Decimal("800.00"),
        estimated_monthly_rent=Decimal("1200.00"),
        disposable_income=Decimal("1700.00"),
        rent_ratio_percent=Decimal("48.00"),
        readiness_score=60,
        status=MoveOutPlan.ReadinessStatus.borderline,
        crime_level="Moderate",
        property_listings=[],
        summary="You may be able to move out.",
    )

@pytest.mark.django_db
class TestMoveOutCheckView:
    def test_get_returns_saved_plan(self, factory, user, move_out_plan):
        request = factory.get("/api/moveout/check/")
        force_authenticate(request, user=user)

        response = MoveOutCheckView.as_view()(request)

        assert response.status_code == 200
        assert response.data["target_postcode"] == "GU2 7XH"

    def test_get_returns_404_when_no_plan(self, factory, user):
        request = factory.get("/api/moveout/check/")
        force_authenticate(request, user=user)

        response = MoveOutCheckView.as_view()(request)

        assert response.status_code == 404
        assert "detail" in response.data