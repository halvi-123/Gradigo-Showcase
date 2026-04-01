import pytest
from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.budget.models import Budget, Category, Transaction, SavingsGoal

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="test@example.com",
        full_name="Test User",
        password="securepassword123",
    )


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def auth_client(client, user):
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def budget(user):
    return Budget.objects.create(
        user=user,
        net_income=Decimal("2500.00"),
        month=date.today().replace(day=1),
    )


@pytest.fixture
def category(budget):
    return Category.objects.create(
        budget=budget,
        category_name="Groceries",
        allocated_amount=Decimal("200.00"),
        limit_amount=Decimal("300.00"),
    )


@pytest.fixture
def transaction(budget, category):
    return Transaction.objects.create(
        budget=budget,
        category=category,
        name="Tesco",
        amount=Decimal("50.00"),
        date=date.today(),
    )


@pytest.fixture
def savings_goal(user):
    return SavingsGoal.objects.create(
        user=user,
        name="Emergency Fund",
        current_amount=Decimal("100.00"),
        target_amount=Decimal("1000.00"),
        target_date=date(2026, 12, 31),
    )


@pytest.mark.django_db
def test_budget_detail_requires_auth(client):
    response = client.get(reverse("budget-detail"))
    assert response.status_code == 401


@pytest.mark.django_db
def test_budget_detail_get(auth_client):
    response = auth_client.get(reverse("budget-detail"))
    assert response.status_code == 200
    assert "net_income" in response.data


@pytest.mark.django_db
def test_budget_dashboard_get(auth_client):
    response = auth_client.get(reverse("budget_dashboard"))
    assert response.status_code == 200
    assert "summary" in response.data


@pytest.mark.django_db
def test_transaction_list_get(auth_client, transaction):
    response = auth_client.get(reverse("transaction-list-create"))
    assert response.status_code == 200
    assert len(response.data) == 1


@pytest.mark.django_db
def test_transaction_create_post(auth_client, budget, category):
    response = auth_client.post(
        reverse("transaction-list-create"),
        {
            "budget": budget.id,
            "category": category.id,
            "name": "Aldi",
            "amount": "25.00",
            "date": str(date.today()),
        },
        format="json",
    )
    assert response.status_code == 201
    assert Transaction.objects.filter(name="Aldi", budget=budget).exists()


@pytest.mark.django_db
def test_transaction_detail_get(auth_client, transaction):
    response = auth_client.get(
        reverse("transaction-detail", kwargs={"pk": transaction.pk})
    )
    assert response.status_code == 200
    assert response.data["name"] == "Tesco"


@pytest.mark.django_db
def test_category_patch(auth_client, category):
    response = auth_client.patch(
        reverse("category-update", kwargs={"pk": category.pk}),
        {"limit_amount": "400.00"},
        format="json",
    )
    assert response.status_code == 200
    category.refresh_from_db()
    assert str(category.limit_amount) == "400.00"


@pytest.mark.django_db
def test_savings_goal_list_get(auth_client, savings_goal):
    response = auth_client.get(reverse("savings-goal-list-create"))
    assert response.status_code == 200
    assert len(response.data) == 1


@pytest.mark.django_db
def test_savings_goal_create_post(auth_client, user):
    response = auth_client.post(
        reverse("savings-goal-list-create"),
        {
            "user": user.pk,
            "name": "Holiday Fund",
            "current_amount": "200.00",
            "target_amount": "1500.00",
            "target_date": "2026-10-01",
        },
        format="json",
    )
    assert response.status_code == 201
    assert SavingsGoal.objects.filter(name="Holiday Fund", user=user).exists()