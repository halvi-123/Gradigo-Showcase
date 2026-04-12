from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date, timedelta

from apps.budget.serializers import (
    BudgetSerializer,
    CategorySerializer,
    TransactionSerializer,
    SavingsGoalSerializer,
)

User = get_user_model()


class CategorySerializerTests(TestCase):

    def test_negative_allocated_amount(self):
        serializer = CategorySerializer(
            data={"budget": 1, "category_name": "Food", "allocated_amount": -10}
        )
        self.assertFalse(serializer.is_valid())

    def test_negative_limit_amount(self):
        serializer = CategorySerializer(
            data={
                "budget": 1,
                "category_name": "Food",
                "allocated_amount": 100,
                "limit_amount": -5,
            }
        )
        self.assertFalse(serializer.is_valid())


class BudgetSerializerTests(TestCase):

    def test_negative_income(self):
        serializer = BudgetSerializer(
            data={"user": 1, "net_income": -100, "month": "2026-01-01"}
        )
        self.assertFalse(serializer.is_valid())


class TransactionSerializerTests(TestCase):

    def test_zero_amount(self):
        serializer = TransactionSerializer(
            data={
                "budget": 1,
                "category": 1,
                "name": "Test",
                "amount": 0,
                "date": "2026-01-01",
            }
        )
        self.assertFalse(serializer.is_valid())

    def test_negative_amount(self):
        serializer = TransactionSerializer(
            data={
                "budget": 1,
                "category": 1,
                "name": "Test",
                "amount": -10,
                "date": "2026-01-01",
            }
        )
        self.assertFalse(serializer.is_valid())


class SavingsGoalSerializerTests(TestCase):

    def test_negative_current_amount(self):
        serializer = SavingsGoalSerializer(
            data={
                "user": 1,
                "name": "Trip",
                "current_amount": -10,
                "target_amount": 100,
            }
        )
        self.assertFalse(serializer.is_valid())

    def test_current_greater_than_target(self):
        serializer = SavingsGoalSerializer(
            data={
                "user": 1,
                "name": "Trip",
                "current_amount": 200,
                "target_amount": 100,
            }
        )
        self.assertFalse(serializer.is_valid())

    def test_past_target_date(self):
        past = date.today() - timedelta(days=1)
        serializer = SavingsGoalSerializer(
            data={
                "user": 1,
                "name": "Trip",
                "current_amount": 10,
                "target_amount": 100,
                "target_date": past,
            }
        )
        self.assertFalse(serializer.is_valid())

    def test_valid_goal(self):
        user = User.objects.create_user(
            email="user5@test.com", full_name="User Five", password="testpass123"
        )

        future = date.today() + timedelta(days=30)

        serializer = SavingsGoalSerializer(
            data={
                "user": user.pk,
                "name": "Trip",
                "current_amount": 10,
                "target_amount": 100,
                "target_date": future,
            }
        )

        self.assertTrue(serializer.is_valid())
