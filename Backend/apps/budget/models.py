from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Budget(models.Model):
    """
    Represents a user's budget for a specific month.

    Each budget is linked to a user and stores the user's net income for that
    period. A user can have multiple budgets, one for each month.

    Attributes:
        user: Foreign key linking the budget to a user.
        net_income: Decimal value representing the user's income.
        month: Date representing the month the budget applies to.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    net_income = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()


class Category(models.Model):
    """
    Represents a spending category within a budget.

    Each category is linked to a specific budget and has a name and an allocated
    amount. A budget can have multiple categories.

    Attributes:
        budget: Foreign key linking the category to a budget.
        category_name: Name of the spending category (e.g., "Groceries", "Rent").
        allocated_amount: Decimal value representing the amount allocated to this category.
    """

    budget = models.ForeignKey(Budget, on_delete=models.CASCADE)
    category_name = models.CharField(max_length=100)
    allocated_amount = models.DecimalField(max_digits=10, decimal_places=2)


class CategoryLimit(models.Model):
    """
    Represents a spending limit for a specific category.

    Each category limit is linked to a category and defines the maximum amount
    that can be spent in that category. A category can have multiple limits (e.g., daily, weekly).

    Attributes:
        category: Foreign key linking the limit to a category.
        limit_amount: Decimal value representing the spending limit for the category.
        limit_type: Char field indicating the type of limit (e.g., "daily", "weekly").
    """

    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    limit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    limit_type = models.CharField(max_length=20)


class Transaction(models.Model):
    """
    Represents a financial transaction within a category.

    Each transaction is linked to a specific category and includes details such as
    the amount spent, the date of the transaction, and an optional description.

    Attributes:
        budget: Foreign key linking the transaction to a budget.
        category: Foreign key linking the transaction to a category.
        amount: Decimal value representing the amount spent in the transaction.
        date: Date of the transaction.
    """

    budget = models.ForeignKey(Budget, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()


class SavingsGoal(models.Model):
    """
    Represents a savings goal for a user.

    Each savings goal is linked to a user and includes a target amount, a description,
    and an optional target date for achieving the goal.

    Attributes:
        user: Foreign key linking the savings goal to a user.
        target_amount: Decimal value representing the target amount for the savings goal.
        target_date: Optional date field indicating when the user aims to achieve the savings goal.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    target_date = models.DateField(null=True, blank=True)
