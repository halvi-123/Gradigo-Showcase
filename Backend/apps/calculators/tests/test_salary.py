import pytest

from apps.calculators.services.salary import calculate_salary_breakdown


@pytest.mark.parametrize(
    "gross_salary,pension_percent,student_loan_plan,tax_region",
    [
        (50000, 5, "plan2", "england"),
        (40000, 0, None, "england"),
        (50000, 0, None, "scotland"),
    ],
)
def test_salary_breakdown_returns_expected_keys(
    gross_salary,
    pension_percent,
    student_loan_plan,
    tax_region,
):
    result = calculate_salary_breakdown(
        gross_salary=gross_salary,
        pension_percent=pension_percent,
        student_loan_plan=student_loan_plan,
        tax_region=tax_region,
    )

    expected_keys = {
        "gross_salary",
        "tax_region",
        "income_tax",
        "national_insurance",
        "student_loan",
        "pension",
        "total_deductions",
        "net_annual",
        "net_monthly",
    }

    assert set(result.keys()) == expected_keys


def test_salary_breakdown_england_basic_case():
    result = calculate_salary_breakdown(
        gross_salary=50000,
        pension_percent=5,
        student_loan_plan="plan2",
        tax_region="england",
    )

    assert result["gross_salary"] == 50000.00
    assert result["tax_region"] == "england"
    assert result["income_tax"] > 0
    assert result["national_insurance"] > 0
    assert result["student_loan"] > 0
    assert result["pension"] == 2500.00


def test_salary_below_personal_allowance_has_no_income_tax():
    result = calculate_salary_breakdown(
        gross_salary=10000,
        pension_percent=0,
        student_loan_plan=None,
        tax_region="england",
    )

    assert result["income_tax"] == 0.00
    assert result["student_loan"] == 0.00


def test_scotland_and_england_return_different_income_tax():
    england = calculate_salary_breakdown(
        gross_salary=50000,
        pension_percent=0,
        student_loan_plan=None,
        tax_region="england",
    )

    scotland = calculate_salary_breakdown(
        gross_salary=50000,
        pension_percent=0,
        student_loan_plan=None,
        tax_region="scotland",
    )

    assert england["income_tax"] != scotland["income_tax"]


def test_pension_reduces_net_salary():
    result = calculate_salary_breakdown(
        gross_salary=40000,
        pension_percent=10,
        student_loan_plan=None,
        tax_region="england",
    )

    assert result["pension"] == 4000.00
    assert result["net_annual"] < 40000.00


def test_none_student_loan_plan_gives_zero_student_loan():
    result = calculate_salary_breakdown(
        gross_salary=50000,
        pension_percent=0,
        student_loan_plan=None,
        tax_region="england",
    )

    assert result["student_loan"] == 0.00


def test_invalid_region_defaults_to_england():
    result = calculate_salary_breakdown(
        gross_salary=50000,
        pension_percent=0,
        student_loan_plan=None,
        tax_region="invalid-region",
    )

    assert result["tax_region"] == "england"
