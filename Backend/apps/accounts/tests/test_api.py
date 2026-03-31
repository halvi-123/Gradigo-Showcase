import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def registered_user(db):
    return User.objects.create_user(
        email="test@example.com",
        full_name="Test User",
        password="securepassword123",
    )


@pytest.mark.django_db
class TestAuthFlow:
    def test_full_auth_flow(self, client):
        # Register
        register_response = client.post(
            reverse("accounts:register"),
            {
                "email": "flow@example.com",
                "full_name": "Flow User",
                "password": "securepassword123",
            },
            format="json",
        )
        assert register_response.status_code == 201

        # Login
        login_response = client.post(
            reverse("accounts:login"),
            {
                "email": "flow@example.com",
                "password": "securepassword123",
            },
            format="json",
        )
        assert login_response.status_code == 200
        assert "access" in login_response.data
        assert "refresh" in login_response.data

        # Logout
        logout_response = client.post(
            reverse("accounts:logout"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )
        assert logout_response.status_code == 200

    def test_cannot_reuse_refresh_token_after_logout(self, client, registered_user):
        # Login
        login_response = client.post(
            reverse("accounts:login"),
            {
                "email": "test@example.com",
                "password": "securepassword123",
            },
            format="json",
        )
        refresh_token = login_response.data["refresh"]

        # Logout
        client.post(
            reverse("accounts:logout"),
            {"refresh": refresh_token},
            format="json",
        )

        # Try to logout again with same token
        second_logout = client.post(
            reverse("accounts:logout"),
            {"refresh": refresh_token},
            format="json",
        )
        assert second_logout.status_code == 400
