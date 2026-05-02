import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

VALID_PASSWORD = "Securepassword123!"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def registered_user(db):
    return User.objects.create_user(
        email="test@example.com",
        full_name="Test User",
        password=VALID_PASSWORD,
    )


@pytest.mark.django_db
class TestAuthFlow:
    def test_full_auth_flow(self, client):
        register_response = client.post(
            reverse("accounts:register"),
            {
                "email": "flow@example.com",
                "full_name": "Flow User",
                "password": VALID_PASSWORD,
            },
            format="json",
        )

        assert register_response.status_code == 201

        login_response = client.post(
            reverse("accounts:login"),
            {
                "email": "flow@example.com",
                "password": VALID_PASSWORD,
            },
            format="json",
        )

        assert login_response.status_code == 200
        assert "access" in login_response.data
        assert "refresh" in login_response.data

        logout_response = client.post(
            reverse("accounts:logout"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        assert logout_response.status_code == 200

    def test_cannot_reuse_refresh_token_after_logout(self, client, registered_user):
        login_response = client.post(
            reverse("accounts:login"),
            {
                "email": "test@example.com",
                "password": VALID_PASSWORD,
            },
            format="json",
        )

        refresh_token = login_response.data["refresh"]

        client.post(
            reverse("accounts:logout"),
            {"refresh": refresh_token},
            format="json",
        )

        second_logout = client.post(
            reverse("accounts:logout"),
            {"refresh": refresh_token},
            format="json",
        )

        assert second_logout.status_code == 400
