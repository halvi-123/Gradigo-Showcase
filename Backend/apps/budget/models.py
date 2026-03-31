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

    class Meta:
        unique_together = ["user", "month"]


class Category(models.Model):
    """
    Represents a spending category within a budget.

    Each category is linked to a specific budget and has a name and an allocated
    amount. A budget can have multiple categories.

    Attributes:
        budget: Foreign key linking the category to a budget.
        category_name: Name of the spending category (e.g., "Groceries", "Rent").
        allocated_amount: Decimal value representing the amount allocated to this category.
        limit_amount: Optional decimal value representing a spending limit for this category.
    """

    budget = models.ForeignKey(Budget, on_delete=models.CASCADE)
    category_name = models.CharField(max_length=100)
    allocated_amount = models.DecimalField(max_digits=10, decimal_places=2)
    limit_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        unique_together = ["budget", "category_name"]



class Transaction(models.Model):
    """
    Represents a financial transaction within a category.

    Each transaction is linked to a specific category and includes details such as
    the amount spent, the date of the transaction.

    Attributes:
        budget: Foreign key linking the transaction to a budget.
        category: Foreign key linking the transaction to a category.
        name: Name or description of the transaction (e.g., "Grocery shopping").
        amount: Decimal value representing the amount spent in the transaction.
        date: Date of the transaction.
    """

    budget = models.ForeignKey(Budget, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()


class SavingsGoal(models.Model):
    """
    Represents a savings goal for a user.

    Each savings goal is linked to a user and includes a target amount, a description,
    and an optional target date for achieving the goal.

    Attributes:
        user: Foreign key linking the savings goal to a user.
        name: Name or description of the savings goal (e.g., "Vacation Fund").
        current_amount: Decimal value representing the current amount saved towards the goal.
        target_amount: Decimal value representing the target amount for the savings goal.
        target_date: Optional date field indicating when the user aims to achieve the savings goal.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    target_date = models.DateField(null=True, blank=True)
