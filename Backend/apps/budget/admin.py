from django.contrib import admin
from .models import Budget, Category, Transaction, SavingsGoal


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "net_income", "month")
    list_filter = ("month", "user")
    search_fields = ("user__username", "user__email")
    ordering = ("-month",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "budget", "category_name",
                    "allocated_amount", "limit_amount")
    list_filter = ("category_name",)
    search_fields = ("category_name", "budget__user__username",
                     "budget__user__email")


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "budget", "category", "name", "amount", "date")
    list_filter = ("date", "category")
    search_fields = (
        "name",
        "budget__user__username",
        "budget__user__email",
        "category__category_name",
    )
    ordering = ("-date",)


@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "name",
        "current_amount",
        "target_amount",
        "target_date",
    )
    list_filter = ("target_date",)
    search_fields = ("name", "user__username", "user__email")
