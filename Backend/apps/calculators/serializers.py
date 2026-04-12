from rest_framework import serializers


class SalaryInputSerializer(serializers.Serializer):
    gross_salary = serializers.FloatField(min_value=0)
    pension_percent = serializers.FloatField(
        required=False, default=0, min_value=0)
    student_loan_plan = serializers.ChoiceField(
        choices=["plan1", "plan2", "plan4", "plan5"],
        required=False,
        allow_null=True,
    )
    tax_region = serializers.ChoiceField(
        choices=["england", "scotland"],
        required=False,
        default="england",
    )
