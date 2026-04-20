from rest_framework import serializers

from .models import MoveOutPlan


class MoveOutCheckSerializer(serializers.Serializer):
    postcode = serializers.CharField(max_length=10)
    monthly_income = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_postcode(self, value):
        value = value.strip().upper()
        if not value:
            raise serializers.ValidationError("Postcode is needed")
        return value

    def validate_monthly_income(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Monthly income must be greater than zero"
            )
        return value

    def validate_monthly_expenses(self, value):
        if value < 0:
            raise serializers.ValidationError("Monthly expenses cannot be negative")
        return value


class MoveOutPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoveOutPlan
        fields = [
            "id",
            "target_postcode",
            "area_name",
            "area_code",
            "monthly_income",
            "monthly_expenses",
            "estimated_monthly_rent",
            "disposable_income",
            "rent_ratio_percent",
            "readiness_score",
            "status",
            "crime_level",
            "property_listings",
            "summary",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "area_name",
            "area_code",
            "estimated_monthly_rent",
            "disposable_income",
            "rent_ratio_percent",
            "readiness_score",
            "status",
            "crime_level",
            "property_listings",
            "summary",
            "created_at",
            "updated_at",
        ]
