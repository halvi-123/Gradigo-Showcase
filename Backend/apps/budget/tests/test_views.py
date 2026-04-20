import pytest
from datetime import date
from decimal import Decimal
from django.contrib.auth import get_user_model

from apps.budget.models import Budget, Category, Transaction, SavingsGoal
from apps.budget.services import (
    default_categories,
    get_or_create_budget,
    create_default_categories,
    create_transaction,
    create_savings_goal,
    calculate_total_allocated,
    calculate_total_spent,
    calculate_total_saved,
    calculate_remaining_income,
    calculate_category_spent,
    calculate_category_breakdown,
    check_overspending_alerts,
    calculate_financial_snapshot_score,
    generate_budget_summary,
)

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="budgetservices@example.com",
        full_name="Budget Services User",
        password="securepassword123",
    )


@pytest.fixture
def budget(user):
    return Budget.objects.create(
        user=user,
        net_income=Decimal("2500.00"),
        month=date.today().replace(day=1),
    )


@pytest.fixture
def budget_with_categories(budget):
    rent = Category.objects.create(
        budget=budget,
        category_name="Rent",
        allocated_amount=Decimal("900.00"),
        limit_amount=Decimal("1000.00"),
    )
    groceries = Category.objects.create(
        budget=budget,
        category_name="Groceries",
        allocated_amount=Decimal("250.00"),
        limit_amount=Decimal("300.00"),
    )
    entertainment = Category.objects.create(
        budget=budget,
        category_name="Entertainment",
        allocated_amount=Decimal("150.00"),
        limit_amount=Decimal("200.00"),
    )

    return {
        "budget": budget,
        "rent": rent,
        "groceries": groceries,
        "entertainment": entertainment,
    }


@pytest.fixture
def populated_budget(user, budget_with_categories):
    budget = budget_with_categories["budget"]
    rent = budget_with_categories["rent"]
    groceries = budget_with_categories["groceries"]
    entertainment = budget_with_categories["entertainment"]

    Transaction.objects.create(
        budget=budget,
        category=rent,
        name="Monthly Rent",
        amount=Decimal("950.00"),
        date=date.today(),
    )
    Transaction.objects.create(
        budget=budget,
        category=groceries,
        name="Tesco Shop",
        amount=Decimal("120.00"),
        date=date.today(),
    )
    Transaction.objects.create(
        budget=budget,
        category=entertainment,
        name="Cinema",
        amount=Decimal("60.00"),
        date=date.today(),
    )

    SavingsGoal.objects.create(
        user=user,
        name="Emergency Fund",
        current_amount=Decimal("200.00"),
        target_amount=Decimal("1000.00"),
        target_date=date(2026, 12, 31),
    )

    return budget


@pytest.mark.django_db
class TestBudgetServices:
    def test_get_or_create_budget_creates_new_budget(self, user):
        budget = get_or_create_budget(user, 1800)

        assert budget.user == user
        assert budget.net_income == Decimal("1800")
        assert budget.month == date.today().replace(day=1)

    def test_get_or_create_budget_returns_existing_budget(self, budget):
        existing_budget = get_or_create_budget(budget.user, 9999)

        assert existing_budget.id == budget.id
        assert existing_budget.net_income == Decimal("2500.00")

    def test_create_default_categories_creates_all_default_categories(self, budget):
        create_default_categories(budget)

        categories = Category.objects.filter(budget=budget)
        category_names = set(categories.values_list("category_name", flat=True))

        assert categories.count() == len(default_categories)
        assert set(default_categories) == category_names

    def test_create_default_categories_does_not_duplicate_categories(self, budget):
        create_default_categories(budget)
        create_default_categories(budget)

        categories = Category.objects.filter(budget=budget)
        assert categories.count() == len(default_categories)

    def test_create_transaction_success(self, budget):
        Category.objects.create(
            budget=budget,
            category_name="Groceries",
            allocated_amount=Decimal("200.00"),
            limit_amount=Decimal("300.00"),
        )

        transaction = create_transaction(
            budget=budget,
            category_name="Groceries",
            name="Aldi Shop",
            amount=45.50,
        )

        assert transaction.budget == budget
        assert transaction.category.category_name == "Groceries"
        assert transaction.name == "Aldi Shop"
        assert transaction.amount == Decimal("45.5")
        assert transaction.date == date.today()

    def test_create_transaction_with_custom_date(self, budget):
        Category.objects.create(
            budget=budget,
            category_name="Bills",
            allocated_amount=Decimal("100.00"),
            limit_amount=Decimal("150.00"),
        )

        custom_date = date(2026, 4, 1)
        transaction = create_transaction(
            budget=budget,
            category_name="Bills",
            name="Electric Bill",
            amount=80.00,
            transaction_date=custom_date,
        )

        assert transaction.date == custom_date

    def test_create_savings_goal_success(self, user):
        savings_goal = create_savings_goal(
            user=user,
            name="Holiday Fund",
            target_amount=1500,
            current_amount=300,
            target_date=date(2026, 10, 1),
        )

        assert savings_goal.user == user
        assert savings_goal.name == "Holiday Fund"
        assert savings_goal.target_amount == Decimal("1500")
        assert savings_goal.current_amount == Decimal("300")
        assert savings_goal.target_date == date(2026, 10, 1)

    def test_calculate_total_allocated(self, budget_with_categories):
        budget = budget_with_categories["budget"]

        total_allocated = calculate_total_allocated(budget)

        assert total_allocated == Decimal("1300.00")

    def test_calculate_total_spent(self, populated_budget):
        total_spent = calculate_total_spent(populated_budget)

        assert total_spent == Decimal("1130.00")

    def test_calculate_total_saved(self, user, populated_budget):
        total_saved = calculate_total_saved(user)

        assert total_saved == Decimal("200.00")

    def test_calculate_remaining_income(self, populated_budget):
        remaining_income = calculate_remaining_income(populated_budget)

        assert remaining_income == Decimal("1170.00")

    def test_calculate_category_spent(self, budget_with_categories):
        budget = budget_with_categories["budget"]
        groceries = budget_with_categories["groceries"]

        Transaction.objects.create(
            budget=budget,
            category=groceries,
            name="Tesco",
            amount=Decimal("50.00"),
            date=date.today(),
        )
        Transaction.objects.create(
            budget=budget,
            category=groceries,
            name="Aldi",
            amount=Decimal("25.00"),
            date=date.today(),
        )

        spent = calculate_category_spent(groceries)

        assert spent == Decimal("75.00")

    def test_calculate_category_breakdown(self, populated_budget):
        breakdown = calculate_category_breakdown(populated_budget)

        assert isinstance(breakdown, list)
        assert len(breakdown) == 3

        category_names = [item["category_name"] for item in breakdown]
        assert "Rent" in category_names
        assert "Groceries" in category_names
        assert "Entertainment" in category_names

    def test_check_overspending_alerts(self, populated_budget):
        rent_category = Category.objects.get(
            budget=populated_budget,
            category_name="Rent",
        )

        Transaction.objects.create(
            budget=populated_budget,
            category=rent_category,
            name="Extra Rent Charge",
            amount=Decimal("100.00"),
            date=date.today(),
        )

        alerts = check_overspending_alerts(populated_budget)

        assert isinstance(alerts, list)
        assert any("Rent" in alert for alert in alerts)

    def test_calculate_financial_snapshot_score_returns_valid_range(
        self, populated_budget
    ):
        score = calculate_financial_snapshot_score(populated_budget)

        assert isinstance(score, int)
        assert 0 <= score <= 100

    def test_generate_budget_summary_returns_string(self, populated_budget):
        summary = generate_budget_summary(populated_budget)

        assert isinstance(summary, str)
        assert "You have spent" in summary

    def test_generate_budget_summary_mentions_savings_when_present(
        self, populated_budget
    ):
        summary = generate_budget_summary(populated_budget)

        assert "savings goals" in summary

    def test_generate_budget_summary_mentions_remaining_income(self, populated_budget):
        summary = generate_budget_summary(populated_budget)

        assert (
            "left" in summary
            or "over budget" in summary
            or "used all of your monthly income" in summary
        )
