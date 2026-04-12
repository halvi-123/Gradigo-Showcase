from rest_framework import serializers


class PensionProjectionInputSerializer(serializers.Serializer):
    current_age = serializers.IntegerField(min_value=16, max_value=80)
    retirement_age = serializers.IntegerField(min_value=55, max_value=90)
    current_salary = serializers.FloatField(min_value=0)
    employee_contribution_percent = serializers.FloatField(
        min_value=0, max_value=100)
    employer_contribution_percent = serializers.FloatField(
        min_value=0, max_value=100)
    current_pot = serializers.FloatField(
        min_value=0, required=False, default=0.0)
    inflation_rate = serializers.FloatField(
        min_value=0, max_value=20, required=False, default=2.5
    )

    def validate(self, data):
        if data["retirement_age"] <= data["current_age"]:
            raise serializers.ValidationError(
                "Retirement age must be greater than current age"
            )
        return data
