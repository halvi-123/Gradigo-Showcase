import pytest
from rest_framework.test import APIClient
from django.urls import reverse


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
class TestPensionProjectionView:
    def test_valid_projection(self, client):
        response = client.post(
            reverse("pension:project"),
            {
                "current_age": 25,
                "retirement_age": 65,
                "current_salary": 30000,
                "employee_contribution_percent": 5,
                "employer_contribution_percent": 3,
            },
            format="json",
        )
        assert response.status_code == 200
        assert "projections" in response.data
        assert "low" in response.data["projections"]
        assert "mid" in response.data["projections"]
        assert "high" in response.data["projections"]

    def test_missing_required_fields(self, client):
        response = client.post(
            reverse("pension:project"),
            {
                "current_age": 25,
            },
            format="json",
        )
        assert response.status_code == 400

    def test_invalid_ages(self, client):
        response = client.post(
            reverse("pension:project"),
            {
                "current_age": 65,
                "retirement_age": 60,
                "current_salary": 30000,
                "employee_contribution_percent": 5,
                "employer_contribution_percent": 3,
            },
            format="json",
        )
        assert response.status_code == 400

    def test_response_contains_yearly_breakdown(self, client):
        response = client.post(
            reverse("pension:project"),
            {
                "current_age": 25,
                "retirement_age": 65,
                "current_salary": 30000,
                "employee_contribution_percent": 5,
                "employer_contribution_percent": 3,
            },
            format="json",
        )
        assert response.status_code == 200
        assert "yearly_breakdown" in response.data["projections"]["mid"]
