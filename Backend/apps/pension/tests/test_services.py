from apps.pension.services.pension import calculate_pension_projection


class TestPensionProjectionService:
    def test_basic_projection(self):
        result = calculate_pension_projection(
            current_age=25,
            retirement_age=65,
            current_salary=30000,
            employee_contribution_percent=5,
            employer_contribution_percent=3,
        )
        assert result["years_to_retirement"] == 40
        assert result["annual_employee_contribution"] == 1500.0
        assert result["annual_employer_contribution"] == 900.0
        assert result["total_annual_contribution"] == 2400.0
        assert "projections" in result
        assert "low" in result["projections"]
        assert "mid" in result["projections"]
        assert "high" in result["projections"]

    def test_higher_growth_yields_higher_pot(self):
        result = calculate_pension_projection(
            current_age=25,
            retirement_age=65,
            current_salary=30000,
            employee_contribution_percent=5,
            employer_contribution_percent=3,
        )
        low = result["projections"]["low"]["projected_pot"]
        mid = result["projections"]["mid"]["projected_pot"]
        high = result["projections"]["high"]["projected_pot"]
        assert low < mid < high

    def test_existing_pot_increases_projection(self):
        result_no_pot = calculate_pension_projection(
            current_age=25,
            retirement_age=65,
            current_salary=30000,
            employee_contribution_percent=5,
            employer_contribution_percent=3,
            current_pot=0,
        )
        result_with_pot = calculate_pension_projection(
            current_age=25,
            retirement_age=65,
            current_salary=30000,
            employee_contribution_percent=5,
            employer_contribution_percent=3,
            current_pot=10000,
        )
        assert (
            result_with_pot["projections"]["mid"]["projected_pot"]
            > result_no_pot["projections"]["mid"]["projected_pot"]
        )

    def test_invalid_ages_returns_error(self):
        result = calculate_pension_projection(
            current_age=65,
            retirement_age=60,
            current_salary=30000,
            employee_contribution_percent=5,
            employer_contribution_percent=3,
        )
        assert "error" in result

    def test_yearly_breakdown_length(self):
        result = calculate_pension_projection(
            current_age=25,
            retirement_age=65,
            current_salary=30000,
            employee_contribution_percent=5,
            employer_contribution_percent=3,
        )
        assert len(result["projections"]["mid"]["yearly_breakdown"]) == 40
