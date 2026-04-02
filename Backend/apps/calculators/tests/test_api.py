import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.calculators.models import SalaryCalculation


User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        full_name="Test User",
        email="test@example.com",
        password="StrongPass123!",
    )


@pytest.fixture
def authenticated_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def valid_payload():
    return {
        "gross_salary": 50000,
        "pension_percent": 5,
        "student_loan_plan": "plan2",
        "tax_region": "england",
    }


@pytest.mark.django_db
def test_unauthenticated_user_cannot_access_salary_calculate(api_client, valid_payload):
    response = api_client.post("/api/salary/calculate/", valid_payload, format="json")

    assert response.status_code in [401, 403]


@pytest.mark.django_db
def test_authenticated_user_can_access_salary_calculate(authenticated_client, valid_payload):
    response = authenticated_client.post("/api/salary/calculate/", valid_payload, format="json")

    assert response.status_code == 200
    assert "gross_salary" in response.data
    assert "income_tax" in response.data
    assert "national_insurance" in response.data
    assert "student_loan" in response.data
    assert "pension" in response.data
    assert "total_deductions" in response.data
    assert "net_annual" in response.data
    assert "net_monthly" in response.data


@pytest.mark.django_db
def test_authenticated_post_creates_salary_calculation(authenticated_client, user, valid_payload):
    before_count = SalaryCalculation.objects.count()

    response = authenticated_client.post("/api/salary/calculate/", valid_payload, format="json")

    after_count = SalaryCalculation.objects.count()

    assert response.status_code == 200
    assert after_count == before_count + 1

    calculation = SalaryCalculation.objects.latest("id")
    assert calculation.user == user
    assert float(calculation.gross_salary) == 50000.0
    assert calculation.tax_region == "england"
    assert calculation.student_loan_plan == "plan2"


@pytest.mark.django_db
def test_invalid_payload_returns_400(authenticated_client):
    invalid_payload = {
        "pension_percent": 5,
        "student_loan_plan": "plan2",
        "tax_region": "england",
    }

    response = authenticated_client.post("/api/salary/calculate/", invalid_payload, format="json")

    assert response.status_code == 400
    assert "gross_salary" in response.data


@pytest.mark.django_db
def test_invalid_student_loan_plan_returns_400(authenticated_client):
    invalid_payload = {
        "gross_salary": 50000,
        "pension_percent": 5,
        "student_loan_plan": "plan9",
        "tax_region": "england",
    }

    response = authenticated_client.post("/api/salary/calculate/", invalid_payload, format="json")

    assert response.status_code == 400
    assert "student_loan_plan" in response.data