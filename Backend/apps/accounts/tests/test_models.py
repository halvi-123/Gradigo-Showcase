import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        user = User.objects.create_user(
            email="test@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.is_active is True
        assert user.is_staff is False

    def test_password_is_hashed(self):
        user = User.objects.create_user(
            email="hash@example.com",
            full_name="Hash User",
            password="securepassword123",
        )
        assert user.password != "securepassword123"

    def test_create_user_no_email(self):
        with pytest.raises(ValueError):
            User.objects.create_user(
                email="",
                full_name="No Email",
                password="securepassword123",
            )

    def test_create_superuser(self):
        user = User.objects.create_superuser(
            email="admin@example.com",
            full_name="Admin User",
            password="securepassword123",
        )
        assert user.is_staff is True
        assert user.is_superuser is True
