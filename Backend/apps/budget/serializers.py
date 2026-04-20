from datetime import date
from rest_framework import serializers
from .models import Budget, Category, Transaction, SavingsGoal


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

    def validate_allocated_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Allocated amount cannot be negative")
        return value

    def validate_limit_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Limit amount can not be negative")
        return value


class BudgetSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Budget
        fields = "__all__"

    def validate_net_income(self, value):
        if value < 0:
            raise serializers.ValidationError("net income cannot be negative")
        return value


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Transaction amount must be greater than 0"
            )
        return value


class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = "__all__"

    def validate_current_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Current amount can not be negative")
        return value

    def validate_target_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Target amount can not be negative")
        return value

    def validate(self, attrs):
        current_amount = attrs.get("current_amount", 0)
        target_amount = attrs.get("target_amount")
        target_date = attrs.get("target_date")

        if target_amount is not None and current_amount > target_amount:
            raise serializers.ValidationError(
                "Current amount cannot be greater than target amount"
            )

        if target_date and target_date < date.today():
            raise serializers.ValidationError("Target date cannot be in the past")

        return attrs


class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["budget", "category", "name", "amount", "date"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Transaction amount must be greater than 0"
            )
        return value

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Transaction name cannot be empty")
        return value


class SavingsGoalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = ["name", "current_amount", "target_amount", "target_date"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Savings goal name cannot be empty")
        return value

    def validate_current_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Current amount cannot be negative")
        return value

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than 0")
        return value

    def validate(self, attrs):
        current_amount = attrs.get("current_amount", 0)
        target_amount = attrs.get("target_amount")
        target_date = attrs.get("target_date")

        if target_amount is not None and current_amount > target_amount:
            raise serializers.ValidationError(
                "Current amount cannot be greater than target amount"
            )

        if target_date and target_date < date.today():
            raise serializers.ValidationError("Target date cannot be in the past")

        return attrs


class CategoryUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["allocated_amount", "limit_amount"]

    def validate_allocated_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Allocated amount cannot be negative.")
        return value

    def validate_limit_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Limit amount cannot be negative.")
        return value
