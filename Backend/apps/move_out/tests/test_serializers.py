import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from apps.move_out.models import MoveOutPlan
from apps.move_out.serializers import MoveOutCheckSerializer, MoveOutPlanSerializer
User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="moveoutserializers@example.com",
        full_name="Move Out Serializers User",
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
        property_listings=[
            {
                "listing_id": "1",
                "display_address": "Flat 1, Guildford",
                "latest_price": 1100,
            }
        ],
        summary="You may be able to move out.",
    )

class TestMoveOutCheckSerializer:
    def test_valid_data(self):
        serializer = MoveOutCheckSerializer(
            data={
                "postcode": " gu2 7xh ",
                "monthly_income": "2500.00",
                "monthly_expenses": "800.00",
            }
        )

        assert serializer.is_valid()
        assert serializer.validated_data["postcode"] == "GU2 7XH"

    def test_postcode_required(self):
        serializer = MoveOutCheckSerializer(
            data={
                "postcode": "   ",
                "monthly_income": "2500.00",
                "monthly_expenses": "800.00",
            }
        )

        assert not serializer.is_valid()
        assert "postcode" in serializer.errors

    def test_monthly_income_must_be_greater_than_zero(self):
        serializer = MoveOutCheckSerializer(
            data={
                "postcode": "GU2 7XH",
                "monthly_income": "0.00",
                "monthly_expenses": "800.00",
            }
        )

        assert not serializer.is_valid()
        assert "monthly_income" in serializer.errors

    def test_monthly_expenses_cannot_be_negative(self):
        serializer = MoveOutCheckSerializer(
            data={
                "postcode": "GU2 7XH",
                "monthly_income": "2500.00",
                "monthly_expenses": "-1.00",
            }
        )

        assert not serializer.is_valid()
        assert "monthly_expenses" in serializer.errors

@pytest.mark.django_db
class TestMoveOutPlanSerializer:
    def test_serializer_outputs_expected_fields(self, move_out_plan):
        data = MoveOutPlanSerializer(move_out_plan).data

        assert data["target_postcode"] == "GU2 7XH"
        assert data["area_name"] == "Guildford"
        assert data["crime_level"] == "Moderate"
        assert data["property_listings"][0]["listing_id"] == "1"
        assert data["status"] == MoveOutPlan.ReadinessStatus.borderline

    def test_read_only_fields_cannot_be_written(self, user):
        serializer = MoveOutPlanSerializer(
            data={
                "target_postcode": "GU2 7XH",
                "area_name": "Changed",
                "area_code": "XXX",
                "monthly_income": "2500.00",
                "monthly_expenses": "800.00",
                "estimated_monthly_rent": "999.99",
                "disposable_income": "999.99",
                "rent_ratio_percent": "10.00",
                "readiness_score": 100,
                "status": "ready",
                "crime_level": "Low",
                "property_listings": [],
                "summary": "Fake",
            }
        )

        assert serializer.is_valid()
        assert "area_name" not in serializer.validated_data
        assert "crime_level" not in serializer.validated_data
        assert "property_listings" not in serializer.validated_data