from apps.calculators.services.salary import calculate_salary_breakdown


def test_salary_breakdown_england_basic_case():
    result = calculate_salary_breakdown(
        gross_salary=40000,
        pension_percent=5,
        student_loan_plan="plan2",
        tax_region="england",
    )

    assert result["gross_salary"] == 40000
    assert result["tax_region"] == "england"
    assert result["income_tax"] > 0
    assert result["national_insurance"] > 0
    assert result["student_loan"] > 0
    assert result["pension"] == 2000.0
    assert result["net_annual"] > 0
    assert result["net_monthly"] > 0


def test_salary_breakdown_scotland_differs_from_england():
    england = calculate_salary_breakdown(
        gross_salary=40000,
        pension_percent=0,
        student_loan_plan=None,
        tax_region="england",
    )
    scotland = calculate_salary_breakdown(
        gross_salary=40000,
        pension_percent=0,
        student_loan_plan=None,
        tax_region="scotland",
    )

    assert england["income_tax"] != scotland["income_tax"]


def test_salary_below_personal_allowance_has_no_income_tax():
    result = calculate_salary_breakdown(
        gross_salary=10000,
        pension_percent=0,
        student_loan_plan=None,
        tax_region="england",
    )

    assert result["income_tax"] == 0.0


def test_salary_with_no_student_loan_has_zero_student_loan_deduction():
    result = calculate_salary_breakdown(
        gross_salary=40000,
        pension_percent=0,
        student_loan_plan=None,
        tax_region="england",
    )

    assert result["student_loan"] == 0.0
