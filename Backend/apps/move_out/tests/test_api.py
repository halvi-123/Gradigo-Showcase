import pytest
from decimal import Decimal
from unittest.mock import patch
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.move_out.models import MoveOutPlan

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="moveoutapi@example.com",
        full_name="Move Out API User",
        password="securepassword123",
    )


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


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
class TestMoveOutAPI:
    def test_get_check_returns_saved_plan(self, authenticated_client, move_out_plan):
        response = authenticated_client.get("/api/moveout/check/")

        assert response.status_code == 200
        assert response.data["target_postcode"] == "GU2 7XH"

    def test_get_check_returns_404_when_no_plan(self, authenticated_client):
        response = authenticated_client.get("/api/moveout/check/")

        assert response.status_code == 404

    @patch("apps.move_out.views.save_move_out_plan")
    def test_post_check_success(
        self, mock_save_move_out_plan, authenticated_client, user
    ):
        plan = MoveOutPlan(
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
        mock_save_move_out_plan.return_value = plan

        response = authenticated_client.post(
            "/api/moveout/check/",
            {
                "postcode": "GU2 7XH",
                "monthly_income": "2500.00",
                "monthly_expenses": "800.00",
            },
            format="json",
        )

        assert response.status_code == 200
        assert response.data["target_postcode"] == "GU2 7XH"

    def test_post_check_invalid_payload(self, authenticated_client):
        response = authenticated_client.post(
            "/api/moveout/check/",
            {
                "postcode": "",
                "monthly_income": "0",
                "monthly_expenses": "-1",
            },
            format="json",
        )

        assert response.status_code == 400

    @patch("apps.move_out.views.save_move_out_plan")
    def test_post_check_service_error(
        self, mock_save_move_out_plan, authenticated_client
    ):
        from apps.move_out.services import MoveOutServiceError

        mock_save_move_out_plan.side_effect = MoveOutServiceError(
            "Service failed")

        response = authenticated_client.post(
            "/api/moveout/check/",
            {
                "postcode": "GU2 7XH",
                "monthly_income": "2500.00",
                "monthly_expenses": "800.00",
            },
            format="json",
        )

        assert response.status_code == 400
        assert response.data["detail"] == "Service failed"
