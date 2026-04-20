import pytest
from decimal import Decimal
from datetime import date
from unittest.mock import Mock, patch
from django.contrib.auth import get_user_model
from openpyxl import Workbook
from apps.move_out.models import MoveOutPlan
from apps.move_out.services import (
    MoveOutServiceError,
    lookup_postcode,
    _to_text,
    _parse_date_from_row,
    _find_rent_values,
    _get_geography_name,
    _find_rent_for_area,
    get_average_rent_from_ons,
    get_crime_level,
    get_rental_listings,
    calculate_disposable_income,
    calculate_rent_ratio_percent,
    calculate_readiness,
    generate_summary,
    save_move_out_plan,
    get_saved_move_out_plan,
)

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="moveoutservices@example.com",
        full_name="Move Out Services User",
        password="securepassword123",
    )


@pytest.fixture
def postcode_data():
    return {
        "postcode": "GU2 7XH",
        "country": "England",
        "region": "South East",
        "admin_district": "Guildford",
        "area_code": "E07000209",
        "latitude": 51.24,
        "longitude": -0.59,
    }


@pytest.fixture
def sample_workbook():
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Sheet1"
    sheet.append(["South East", "March 2026", 1500])
    sheet.append(["South East", "February 2026", 1400])
    sheet.append(["England", "March 2026", 1300])
    return workbook


@pytest.mark.django_db
class TestMoveOutServices:
    @patch("apps.move_out.services.requests.get")
    def test_lookup_postcode_success(self, mock_get):
        mock_response = Mock()
        mock_response.json.return_value = {
            "result": {
                "postcode": "GU2 7XH",
                "country": "England",
                "region": "South East",
                "admin_district": "Guildford",
                "codes": {"admin_district": "E07000209"},
                "latitude": 51.24,
                "longitude": -0.59,
            }
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        result = lookup_postcode("gu2 7xh")

        assert result["postcode"] == "GU2 7XH"
        assert result["area_code"] == "E07000209"

    def test_lookup_postcode_raises_for_blank_postcode(self):
        with pytest.raises(MoveOutServiceError):
            lookup_postcode("   ")

    @patch("apps.move_out.services.requests.get")
    def test_lookup_postcode_raises_for_invalid_postcode(self, mock_get):
        mock_response = Mock()
        mock_response.json.return_value = {"result": None}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        with pytest.raises(MoveOutServiceError):
            lookup_postcode("INVALID")

    def test_to_text(self):
        assert _to_text(None) == ""
        assert _to_text("  Hello ") == "hello"

    def test_parse_date_from_row(self):
        values = ["South East", "March 2026", 1500]
        result = _parse_date_from_row(values)
        assert result == date(2026, 3, 1)

    def test_find_rent_values(self):
        values = ["South East", "March 2026", 1500, 50, 20000]
        result = _find_rent_values(values)
        assert result == [Decimal("1500")]

    def test_get_geography_name_prefers_region_for_england(self, postcode_data):
        assert _get_geography_name(postcode_data) == "South East"

    def test_find_rent_for_area(self, sample_workbook):
        rent = _find_rent_for_area(sample_workbook, "South East")
        assert rent == Decimal("1500")

    @patch("apps.move_out.services._download_ons_workbook")
    def test_get_average_rent_from_ons(
        self, mock_download, postcode_data, sample_workbook
    ):
        mock_download.return_value = sample_workbook

        rent = get_average_rent_from_ons(postcode_data)

        assert rent == Decimal("1500.00")

    @patch("apps.move_out.services.requests.get")
    def test_get_crime_level_returns_moderate(self, mock_get, postcode_data):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = [{}] * 80
        mock_get.return_value = mock_response

        result = get_crime_level(postcode_data)

        assert result == "Moderate"

    @patch("apps.move_out.services.requests.get")
    def test_get_crime_level_returns_unknown_on_request_error(
        self, mock_get, postcode_data
    ):
        import requests

        mock_get.side_effect = requests.RequestException("boom")

        result = get_crime_level(postcode_data)

        assert result == "Unknown"

    @patch("apps.move_out.services.requests.post")
    def test_get_rental_listings_success(self, mock_post):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.status_code = 201
        mock_response.text = "ok"
        mock_response.json.return_value = [
            {
                "id": "abc123",
                "displayAddress": "Flat 1, Guildford",
                "price": 1200,
                "displayPrice": "£1,200 pcm",
                "bedrooms": 1,
                "bathrooms": 1,
                "propertyType": "Flat",
                "propertySubType": "Apartment",
                "agent": "Test Agent",
                "agentBranch": "Guildford Branch",
                "addedOn": "2026-04-09",
                "imageUrl": "https://example.com/image.jpg",
                "url": "https://example.com/listing",
            }
        ]
        mock_post.return_value = mock_response

        results = get_rental_listings("GU2 7XH", Decimal("1500.00"))

        assert len(results) == 1
        assert results[0]["listing_id"] == "abc123"
        assert results[0]["latest_price"] == 1200

    @patch("apps.move_out.services.requests.post")
    def test_get_rental_listings_filters_out_expensive_properties(self, mock_post):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.status_code = 201
        mock_response.text = "ok"
        mock_response.json.return_value = [
            {"id": "1", "displayAddress": "A", "price": 3000},
            {"id": "2", "displayAddress": "B", "price": 1200},
        ]
        mock_post.return_value = mock_response

        results = get_rental_listings("GU2 7XH", Decimal("1500.00"))

        assert len(results) == 1
        assert results[0]["listing_id"] == "2"

    def test_calculate_disposable_income(self):
        result = calculate_disposable_income(Decimal("2500.00"), Decimal("800.00"))
        assert result == Decimal("1700.00")

    def test_calculate_rent_ratio_percent(self):
        result = calculate_rent_ratio_percent(Decimal("2500.00"), Decimal("1000.00"))
        assert result == Decimal("40.00")

    def test_calculate_readiness_ready(self):
        result = calculate_readiness(
            Decimal("4000.00"), Decimal("1000.00"), Decimal("1000.00")
        )
        assert result["status"] == MoveOutPlan.ReadinessStatus.ready
        assert result["readiness_score"] == 85

    def test_calculate_readiness_needs_improvement(self):
        result = calculate_readiness(
            Decimal("2000.00"), Decimal("1000.00"), Decimal("1500.00")
        )
        assert result["status"] == MoveOutPlan.ReadinessStatus.needs_improvement
        assert result["readiness_score"] == 35

    def test_generate_summary_contains_crime_level(self):
        summary = generate_summary(
            MoveOutPlan.ReadinessStatus.ready,
            Decimal("1200.00"),
            "Moderate",
        )
        assert "£1200.00" in summary
        assert "moderate" in summary.lower()

    @patch("apps.move_out.services.lookup_postcode")
    @patch("apps.move_out.services.get_average_rent_from_ons")
    @patch("apps.move_out.services.get_crime_level")
    @patch("apps.move_out.services.get_rental_listings")
    def test_save_move_out_plan_creates_plan(
        self,
        mock_get_rental_listings,
        mock_get_crime_level,
        mock_get_average_rent_from_ons,
        mock_lookup_postcode,
        user,
        postcode_data,
    ):
        mock_lookup_postcode.return_value = postcode_data
        mock_get_average_rent_from_ons.return_value = Decimal("1200.00")
        mock_get_crime_level.return_value = "Moderate"
        mock_get_rental_listings.return_value = [{"listing_id": "abc123"}]

        plan = save_move_out_plan(
            user=user,
            postcode="GU2 7XH",
            monthly_income="2500.00",
            monthly_expenses="800.00",
        )

        assert plan.user == user
        assert plan.target_postcode == "GU2 7XH"
        assert plan.crime_level == "Moderate"
        assert plan.property_listings == [{"listing_id": "abc123"}]

    def test_get_saved_move_out_plan_returns_none_when_missing(self, user):
        assert get_saved_move_out_plan(user) is None
