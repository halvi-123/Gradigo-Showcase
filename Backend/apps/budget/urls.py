from django.urls import path
from .views import (
    BudgetDetailView,
    CategoryUpdateView,
    CategoryListCreateView,
    BudgetDashboardView,
    TransactionListCreateView,
    TransactionDetailView,
    SavingsGoalListCreateView,
    SavingsGoalDetailView,
)

urlpatterns = [
    # Budget urls
    path("budget/", BudgetDetailView.as_view(), name="budget-detail"),
    path("dashboard/", BudgetDashboardView.as_view(), name="budget_dashboard"),
    # Category URLs
    path("categories/", CategoryListCreateView.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryUpdateView.as_view(), name="category-update"),
    # Transaction URLs
    path(
        "transactions/",
        TransactionListCreateView.as_view(),
        name="transaction-list-create",
    ),
    path(
        "transactions/<int:pk>/",
        TransactionDetailView.as_view(),
        name="transaction-detail",
    ),
    # Savings Goal URLs
    path(
        "savings-goals/",
        SavingsGoalListCreateView.as_view(),
        name="savings-goal-list-create",
    ),
    path(
        "savings-goals/<int:pk>/",
        SavingsGoalDetailView.as_view(),
        name="savings-goal-detail",
    ),
]
