from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "full_name", "password"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists"
            )
        return value

    def validate_full_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Full name cannot be empty")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            password=validated_data["password"],
        )
