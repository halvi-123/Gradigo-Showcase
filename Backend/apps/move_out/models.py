from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings

class MoveOutPlan(models.Model):
    class ReadinessStatus(models.TextChoices):
        ready = "ready", "Ready"
        borderline = "borderline", "Borderline"
        needs_improvement = "needs_improvement", "Needs Improvement"
        not_ready = "not_ready", "Not Ready"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="move_out_plan",
    )

    target_postcode = models.CharField(max_length=10)
    area_name = models.CharField(max_length=255, blank=True)
    area_code = models.CharField(max_length=32, blank = True)

    monthly_income = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    monthly_expenses = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    estimated_monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    disposable_income = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    rent_ratio_percent = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    readiness_score = models.PositiveSmallIntegerField(default=0)
    status = models.CharField(
        max_length=25,
        choices=ReadinessStatus.choices,
        default=ReadinessStatus.not_ready,
    )
    summary = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Move Out Plan"
        verbose_name_plural = "Move Out Plans"

    def __str__(self):
        return f"{self.user} - {self.target_postcode} - {self.status}"
