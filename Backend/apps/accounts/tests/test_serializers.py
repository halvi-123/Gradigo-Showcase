import pytest
from django.contrib.auth import get_user_model
from apps.accounts.serializers import RegisterSerializer

User = get_user_model()

VALID_PASSWORD = "Securepassword123!"


@pytest.mark.django_db
class TestRegisterSerializer:
    def test_valid_data(self):
        data = {
            "email": "test@example.com",
            "full_name": "Test User",
            "password": VALID_PASSWORD,
        }

        serializer = RegisterSerializer(data=data)

        assert serializer.is_valid()

    def test_duplicate_email(self):
        User.objects.create_user(
            email="test@example.com",
            full_name="Test User",
            password=VALID_PASSWORD,
        )

        data = {
            "email": "test@example.com",
            "full_name": "Another User",
            "password": VALID_PASSWORD,
        }

        serializer = RegisterSerializer(data=data)

        assert not serializer.is_valid()
        assert "email" in serializer.errors

    def test_password_too_short(self):
        data = {
            "email": "short@example.com",
            "full_name": "Short Pass",
            "password": "S1!",
        }

        serializer = RegisterSerializer(data=data)

        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_password_missing_capital_letter(self):
        data = {
            "email": "lowercase@example.com",
            "full_name": "Lowercase User",
            "password": "securepassword123!",
        }

        serializer = RegisterSerializer(data=data)

        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_password_missing_special_character(self):
        data = {
            "email": "nospecial@example.com",
            "full_name": "No Special User",
            "password": "Securepassword123",
        }

        serializer = RegisterSerializer(data=data)

        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_empty_full_name(self):
        data = {
            "email": "test@example.com",
            "full_name": "   ",
            "password": VALID_PASSWORD,
        }

        serializer = RegisterSerializer(data=data)

        assert not serializer.is_valid()
        assert "full_name" in serializer.errors

    def test_invalid_email(self):
        data = {
            "email": "notanemail",
            "full_name": "Test User",
            "password": VALID_PASSWORD,
        }

        serializer = RegisterSerializer(data=data)

        assert not serializer.is_valid()
        assert "email" in serializer.errors
