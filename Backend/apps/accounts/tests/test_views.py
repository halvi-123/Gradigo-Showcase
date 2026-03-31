import pytest
from django.urls import reverse
from rest_framework.test import APIClient
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
class TestRegisterView:
    def test_register_success(self, client):
        response = client.post(
            reverse("accounts:register"),
            {
                "email": "new@example.com",
                "full_name": "New User",
                "password": "securepassword123",
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["message"] == "User registered successfully"

    def test_register_duplicate_email(self, client, registered_user):
        response = client.post(
            reverse("accounts:register"),
            {
                "email": "test@example.com",
                "full_name": "Another User",
                "password": "securepassword123",
            },
            format="json",
        )
        assert response.status_code == 400

    def test_register_invalid_email(self, client):
        response = client.post(
            reverse("accounts:register"),
            {
                "email": "notanemail",
                "full_name": "Test User",
                "password": "securepassword123",
            },
            format="json",
        )
        assert response.status_code == 400


@pytest.mark.django_db
class TestLoginView:
    def test_login_success(self, client, registered_user):
        response = client.post(
            reverse("accounts:login"),
            {
                "email": "test@example.com",
                "password": "securepassword123",
            },
            format="json",
        )
        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_wrong_password(self, client, registered_user):
        response = client.post(
            reverse("accounts:login"),
            {
                "email": "test@example.com",
                "password": "wrongpassword",
            },
            format="json",
        )
        assert response.status_code == 401

    def test_login_missing_fields(self, client):
        response = client.post(
            reverse("accounts:login"),
            {"email": "test@example.com"},
            format="json",
        )
        assert response.status_code == 400


@pytest.mark.django_db
class TestLogoutView:
    def test_logout_success(self, client, registered_user):
        login_response = client.post(
            reverse("accounts:login"),
            {
                "email": "test@example.com",
                "password": "securepassword123",
            },
            format="json",
        )
        refresh_token = login_response.data["refresh"]
        response = client.post(
            reverse("accounts:logout"),
            {"refresh": refresh_token},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["message"] == "Logged out successfully"

    def test_logout_missing_token(self, client):
        response = client.post(
            reverse("accounts:logout"),
            {},
            format="json",
        )
        assert response.status_code == 400


@pytest.mark.django_db
class TestMeView:
    def test_me_authenticated(self, client, registered_user):
        login_response = client.post(
            reverse("accounts:login"),
            {
                "email": "test@example.com",
                "password": "securepassword123",
            },
            format="json",
        )
        access_token = login_response.data["access"]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = client.get(reverse("accounts:me"))
        assert response.status_code == 200
        assert response.data["email"] == "test@example.com"
        assert response.data["full_name"] == "Test User"

    def test_me_unauthenticated(self, client):
        response = client.get(reverse("accounts:me"))
        assert response.status_code == 401
