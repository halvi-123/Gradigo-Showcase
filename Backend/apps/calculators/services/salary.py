from typing import Dict, Optional

from .tax_config import (
    NI_ADDITIONAL_RATE,
    NI_MAIN_RATE,
    NI_PRIMARY_THRESHOLD,
    NI_UPPER_EARNINGS_LIMIT,
    PERSONAL_ALLOWANCE,
    REST_OF_UK_BANDS,
    SCOTLAND_BANDS,
    STUDENT_LOAN_PLANS,
)


def _calculate_band_tax(
    income: float, bands: list[tuple[float, float, float]]
) -> float:
    tax = 0.0

    for lower, upper, rate in bands:
        if income > lower:
            taxable_amount = min(income, upper) - lower
            tax += taxable_amount * rate

    return tax


def calculate_rest_of_uk_income_tax(taxable_income: float) -> float:
    if taxable_income <= PERSONAL_ALLOWANCE:
        return 0.0
    return _calculate_band_tax(taxable_income, REST_OF_UK_BANDS)


def calculate_scottish_income_tax(taxable_income: float) -> float:
    if taxable_income <= PERSONAL_ALLOWANCE:
        return 0.0
    return _calculate_band_tax(taxable_income, SCOTLAND_BANDS)


def calculate_national_insurance(gross_salary: float) -> float:
    if gross_salary <= NI_PRIMARY_THRESHOLD:
        return 0.0

    ni = 0.0

    if gross_salary <= NI_UPPER_EARNINGS_LIMIT:
        ni += (gross_salary - NI_PRIMARY_THRESHOLD) * NI_MAIN_RATE
    else:
        ni += (NI_UPPER_EARNINGS_LIMIT - NI_PRIMARY_THRESHOLD) * NI_MAIN_RATE
        ni += (gross_salary - NI_UPPER_EARNINGS_LIMIT) * NI_ADDITIONAL_RATE

    return ni


def calculate_student_loan(
    gross_salary: float,
    student_loan_plan: Optional[str],
) -> float:
    if not student_loan_plan:
        return 0.0

    plan = student_loan_plan.lower()
    config = STUDENT_LOAN_PLANS.get(plan)

    if not config:
        return 0.0

    threshold = config["threshold"]
    rate = config["rate"]

    if gross_salary <= threshold:
        return 0.0

    return (gross_salary - threshold) * rate


def calculate_salary_breakdown(
    gross_salary: float,
    pension_percent: float = 0.0,
    student_loan_plan: Optional[str] = None,
    tax_region: str = "england",
) -> Dict[str, float | str]:
    """
    Calculate annual and monthly UK salary breakdown.
    """
    pension_percent = max(0.0, pension_percent)
    pension = gross_salary * (pension_percent / 100)
    taxable_income = gross_salary - pension

    region = tax_region.lower().strip()

    if region not in {"england", "scotland"}:
        region = "england"

    if region == "scotland":
        income_tax = calculate_scottish_income_tax(taxable_income)
    else:
        income_tax = calculate_rest_of_uk_income_tax(taxable_income)

    national_insurance = calculate_national_insurance(gross_salary)
    student_loan = calculate_student_loan(gross_salary, student_loan_plan)

    total_deductions = income_tax + national_insurance + student_loan + pension
    net_annual = gross_salary - total_deductions
    net_monthly = net_annual / 12

    return {
        "gross_salary": round(gross_salary, 2),
        "tax_region": region,
        "income_tax": round(income_tax, 2),
        "national_insurance": round(national_insurance, 2),
        "student_loan": round(student_loan, 2),
        "pension": round(pension, 2),
        "total_deductions": round(total_deductions, 2),
        "net_annual": round(net_annual, 2),
        "net_monthly": round(net_monthly, 2),
    }
