import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from apps.move_out.models import MoveOutPlan
User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="moveoutmodels@example.com",
        full_name="Move Out Models User",
        password="securepassword123",
    )

@pytest.mark.django_db
class TestMoveOutPlanModel:
    def test_create_move_out_plan(self, user):
        plan = MoveOutPlan.objects.create(
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
            summary="Test summary",
        )

        assert plan.user == user
        assert plan.target_postcode == "GU2 7XH"
        assert plan.area_name == "Guildford"
        assert plan.area_code == "E07000209"
        assert plan.monthly_income == Decimal("2500.00")
        assert plan.property_listings == []

    def test_str_returns_expected_format(self, user):
        plan = MoveOutPlan.objects.create(
            user=user,
            target_postcode="GU2 7XH",
            monthly_income=Decimal("2500.00"),
            monthly_expenses=Decimal("800.00"),
            estimated_monthly_rent=Decimal("1200.00"),
            status=MoveOutPlan.ReadinessStatus.ready,
        )

        result = str(plan)

        assert user.email in result or user.full_name in result
        assert "GU2 7XH" in result
        assert "ready" in result

    def test_default_status_is_not_ready(self, user):
        plan = MoveOutPlan.objects.create(
            user=user,
            target_postcode="GU2 7XH",
            monthly_income=Decimal("2500.00"),
            monthly_expenses=Decimal("800.00"),
            estimated_monthly_rent=Decimal("1200.00"),
        )

        assert plan.status == MoveOutPlan.ReadinessStatus.not_ready

    def test_default_crime_level_and_property_listings(self, user):
        plan = MoveOutPlan.objects.create(
            user=user,
            target_postcode="GU2 7XH",
            monthly_income=Decimal("2500.00"),
            monthly_expenses=Decimal("800.00"),
            estimated_monthly_rent=Decimal("1200.00"),
        )

        assert plan.crime_level == ""
        assert plan.property_listings == []

    def test_user_can_only_have_one_move_out_plan(self, user):
        MoveOutPlan.objects.create(
            user=user,
            target_postcode="GU2 7XH",
            monthly_income=Decimal("2500.00"),
            monthly_expenses=Decimal("800.00"),
            estimated_monthly_rent=Decimal("1200.00"),
        )

        with pytest.raises(Exception):
            MoveOutPlan.objects.create(
                user=user,
                target_postcode="SW1A 1AA",
                monthly_income=Decimal("3000.00"),
                monthly_expenses=Decimal("1000.00"),
                estimated_monthly_rent=Decimal("1500.00"),
            )