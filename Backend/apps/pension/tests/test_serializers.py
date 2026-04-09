from apps.pension.serializers import PensionProjectionInputSerializer


class TestPensionProjectionInputSerializer:
    def test_valid_data(self):
        data = {
            "current_age": 25,
            "retirement_age": 65,
            "current_salary": 30000,
            "employee_contribution_percent": 5,
            "employer_contribution_percent": 3,
        }
        serializer = PensionProjectionInputSerializer(data=data)
        assert serializer.is_valid()

    def test_retirement_age_less_than_current_age(self):
        data = {
            "current_age": 65,
            "retirement_age": 60,
            "current_salary": 30000,
            "employee_contribution_percent": 5,
            "employer_contribution_percent": 3,
        }
        serializer = PensionProjectionInputSerializer(data=data)
        assert not serializer.is_valid()

    def test_retirement_age_equal_to_current_age(self):
        data = {
            "current_age": 65,
            "retirement_age": 65,
            "current_salary": 30000,
            "employee_contribution_percent": 5,
            "employer_contribution_percent": 3,
        }
        serializer = PensionProjectionInputSerializer(data=data)
        assert not serializer.is_valid()

    def test_negative_salary(self):
        data = {
            "current_age": 25,
            "retirement_age": 65,
            "current_salary": -1000,
            "employee_contribution_percent": 5,
            "employer_contribution_percent": 3,
        }
        serializer = PensionProjectionInputSerializer(data=data)
        assert not serializer.is_valid()

    def test_contribution_over_100_percent(self):
        data = {
            "current_age": 25,
            "retirement_age": 65,
            "current_salary": 30000,
            "employee_contribution_percent": 110,
            "employer_contribution_percent": 3,
        }
        serializer = PensionProjectionInputSerializer(data=data)
        assert not serializer.is_valid()

    def test_optional_fields_use_defaults(self):
        data = {
            "current_age": 25,
            "retirement_age": 65,
            "current_salary": 30000,
            "employee_contribution_percent": 5,
            "employer_contribution_percent": 3,
        }
        serializer = PensionProjectionInputSerializer(data=data)
        assert serializer.is_valid()
        assert serializer.validated_data["current_pot"] == 0.0
        assert serializer.validated_data["inflation_rate"] == 2.5
