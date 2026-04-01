from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from decimal import Decimal
from datetime import date

from apps.budget.models import Budget, Category, Transaction, SavingsGoal

User = get_user_model()


class BudgetModelTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="user1", password="pass")

    def test_create_budget(self):
        budget = Budget.objects.create(
            user=self.user,
            net_income=Decimal("2000.00"),
            month=date(2026, 1, 1)
        )
        self.assertEqual(budget.net_income, Decimal("2000.00"))

    def test_unique_budget_per_month(self):
        Budget.objects.create(
            user=self.user,
            net_income=1000,
            month=date(2026, 1, 1)
        )
        with self.assertRaises(IntegrityError):
            Budget.objects.create(
                user=self.user,
                net_income=1500,
                month=date(2026, 1, 1)
            )

    def test_cascade_delete_budget(self):
        budget = Budget.objects.create(
            user=self.user,
            net_income=1000,
            month=date(2026, 1, 1)
        )
        self.user.delete()
        self.assertFalse(Budget.objects.filter(id=budget.id).exists())


class CategoryModelTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="user2")
        self.budget = Budget.objects.create(
            user=self.user,
            net_income=2000,
            month=date(2026, 1, 1)
        )

    def test_create_category(self):
        category = Category.objects.create(
            budget=self.budget,
            category_name="Groceries",
            allocated_amount=Decimal("300.00")
        )
        self.assertEqual(category.category_name, "Groceries")

    def test_unique_category_per_budget(self):
        Category.objects.create(
            budget=self.budget,
            category_name="Rent",
            allocated_amount=500
        )
        with self.assertRaises(IntegrityError):
            Category.objects.create(
                budget=self.budget,
                category_name="Rent",
                allocated_amount=600
            )

    def test_category_limit_optional(self):
        category = Category.objects.create(
            budget=self.budget,
            category_name="Travel",
            allocated_amount=200
        )
        self.assertIsNone(category.limit_amount)


class TransactionModelTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="user3")
        self.budget = Budget.objects.create(
            user=self.user,
            net_income=3000,
            month=date(2026, 1, 1)
        )
        self.category = Category.objects.create(
            budget=self.budget,
            category_name="Food",
            allocated_amount=400
        )

    def test_create_transaction(self):
        transaction = Transaction.objects.create(
            budget=self.budget,
            category=self.category,
            name="Lunch",
            amount=Decimal("12.50"),
            date=date.today()
        )
        self.assertEqual(transaction.amount, Decimal("12.50"))

    def test_transaction_cascade(self):
        Transaction.objects.create(
            budget=self.budget,
            category=self.category,
            name="Dinner",
            amount=20,
            date=date.today()
        )
        self.category.delete()
        self.assertEqual(Transaction.objects.count(), 0)


class SavingsGoalModelTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="user4")

    def test_create_goal(self):
        goal = SavingsGoal.objects.create(
            user=self.user,
            name="Vacation",
            target_amount=Decimal("1000.00")
        )
        self.assertEqual(goal.current_amount, 0)

    def test_optional_target_date(self):
        goal = SavingsGoal.objects.create(
            user=self.user,
            name="Laptop",
            target_amount=1500
        )
        self.assertIsNone(goal.target_date)