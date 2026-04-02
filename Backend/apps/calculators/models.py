from django.conf import settings
from django.db import models


class SalaryCalculation(models.Model):
    TAX_REGION_CHOICES = [
        ("england", "England"),
        ("scotland", "Scotland"),
    ]

    STUDENT_LOAN_CHOICES = [
        ("plan1", "Plan 1"),
        ("plan2", "Plan 2"),
        ("plan4", "Plan 4"),
        ("plan5", "Plan 5"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="salary_calculations",
    )
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)
    pension_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    student_loan_plan = models.CharField(
        max_length=10,
        choices=STUDENT_LOAN_CHOICES,
        blank=True,
        null=True,
    )
    tax_region = models.CharField(
        max_length=20,
        choices=TAX_REGION_CHOICES,
        default="england",
    )

    income_tax = models.DecimalField(max_digits=12, decimal_places=2)
    national_insurance = models.DecimalField(max_digits=12, decimal_places=2)
    student_loan = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pension = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2)
    net_annual = models.DecimalField(max_digits=12, decimal_places=2)
    net_monthly = models.DecimalField(max_digits=12, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user} - {self.gross_salary} - {self.created_at:%Y-%m-%d %H:%M}"