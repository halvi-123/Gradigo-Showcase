from typing import Dict


def calculate_pension_projection(
    current_age: int,
    retirement_age: int,
    current_salary: float,
    employee_contribution_percent: float,
    employer_contribution_percent: float,
    current_pot: float = 0.0,
    inflation_rate: float = 2.5,
) -> Dict:
    """
    Projects pension growth under low, mid and high growth scenarios.
    All monetary values are in today's money (inflation adjusted).
    """
    years_to_retirement = retirement_age - current_age

    if years_to_retirement <= 0:
        return {"error": "Retirement age must be greater than current age"}

    annual_employee_contribution = current_salary * (
        employee_contribution_percent / 100
    )
    annual_employer_contribution = current_salary * (
        employer_contribution_percent / 100
    )
    total_annual_contribution = (
        annual_employee_contribution + annual_employer_contribution
    )

    growth_scenarios = {
        "low": 3.0,
        "mid": 5.0,
        "high": 7.0,
    }

    results = {}

    for scenario, nominal_rate in growth_scenarios.items():
        real_rate = (1 + nominal_rate / 100) / (1 + inflation_rate / 100) - 1
        pot = current_pot
        yearly_breakdown = []

        for year in range(1, years_to_retirement + 1):
            pot = (pot + total_annual_contribution) * (1 + real_rate)
            yearly_breakdown.append(
                {
                    "year": year,
                    "age": current_age + year,
                    "pot_value": round(pot, 2),
                }
            )

        results[scenario] = {
            "growth_rate_percent": nominal_rate,
            "real_growth_rate_percent": round(real_rate * 100, 2),
            "projected_pot": round(pot, 2),
            "yearly_breakdown": yearly_breakdown,
        }

    return {
        "current_age": current_age,
        "retirement_age": retirement_age,
        "years_to_retirement": years_to_retirement,
        "annual_employee_contribution": round(annual_employee_contribution, 2),
        "annual_employer_contribution": round(annual_employer_contribution, 2),
        "total_annual_contribution": round(total_annual_contribution, 2),
        "inflation_rate": inflation_rate,
        "projections": results,
    }
