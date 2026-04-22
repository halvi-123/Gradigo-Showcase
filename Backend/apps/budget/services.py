from decimal import Decimal
from datetime import date
from .models import Budget, Category, Transaction, SavingsGoal

default_categories = [
    "Rent",
    "Bills",
    "Groceries",
    "Entertainment",
    "Subscriptions",
    "Transport",
]


def get_or_create_budget(
    user, net_income
):  # get the user's current budget or create if doesnt exist
    today = date.today()
    first_day_of_month = today.replace(day=1)

    budget, created = Budget.objects.get_or_create(
        user=user,
        month=first_day_of_month,
        defaults={"net_income": Decimal(str(net_income))},
    )
    return budget


def create_default_categories(budget):  # create default budget categories
    for name in default_categories:
        Category.objects.get_or_create(
            budget=budget,
            category_name=name,
            defaults={
                "allocated_amount": Decimal("0.00"),
                "limit_amount": None,
            },
        )


def create_transaction(budget, category_name, name, amount, transaction_date=None):
    # creates a new spending transaction within a category
    category = Category.objects.get(budget=budget, category_name=category_name)

    if transaction_date is None:
        transaction_date = date.today()

    return Transaction.objects.create(
        budget=budget,
        category=category,
        name=name,
        amount=Decimal(str(amount)),
        date=transaction_date,
    )


def create_savings_goal(user, name, target_amount, current_amount=0, target_date=None):
    # creates new savings pot for user
    return SavingsGoal.objects.create(
        user=user,
        name=name,
        target_amount=Decimal(str(target_amount)),
        current_amount=Decimal(str(current_amount)),
        target_date=target_date,
    )


def calculate_total_allocated(budget):
    # caclulates the total of all category allocated amounts in the budget
    categories = Category.objects.filter(budget=budget)
    return sum((category.allocated_amount for category in categories), Decimal("0.00"))


def calculate_total_spent(budget):
    # calculates all transaction amounts within the budget
    transactions = Transaction.objects.filter(budget=budget)
    return sum((transaction.amount for transaction in transactions), Decimal("0.00"))


def calculate_total_saved(user):
    # calculates users total savings among all saving pots
    goals = SavingsGoal.objects.filter(user=user)
    return sum((goal.current_amount for goal in goals), Decimal("0.00"))


def calculate_remaining_income(budget):
    # calculates how much income is left after spendings/savings
    total_spent = calculate_total_spent(budget)
    remaining = budget.net_income - total_spent
    return remaining


def calculate_category_spent(category):
    # totals how much has been spent in one category
    transactions = Transaction.objects.filter(category=category)
    return sum((transaction.amount for transaction in transactions), Decimal("0.00"))


def calculate_category_breakdown(budget):
    # returns per category spending breakdown for charts
    categories = Category.objects.filter(budget=budget)
    total_spent = calculate_total_spent(budget)
    breakdown = []

    for category in categories:
        spent = calculate_category_spent(category)

        if total_spent > 0:
            percentage = (spent / total_spent) * 100
        else:
            percentage = Decimal("0.00")

        breakdown.append(
            {
                "id": category.id,
                "category_name": category.category_name,
                "spent_amount": float(spent),
                "limit_amount": (
                    float(category.limit_amount)
                    if category.limit_amount is not None
                    else None
                ),
                "percentage": round(float(percentage), 2),
            }
        )

    return breakdown


def check_overspending_alerts(budget):
    # check whether any category has went over its limit
    alerts = []
    categories = Category.objects.filter(budget=budget)

    for category in categories:
        spent = calculate_category_spent(category)

        if category.limit_amount is not None and spent > category.limit_amount:
            excess = spent - category.limit_amount
            alerts.append(f"{category.category_name} limit exceeded by £{excess:.2f}.")

        if category.category_name == "Rent" and budget.net_income > 0:
            percent_of_income = (spent / budget.net_income) * 100
            if percent_of_income > 50:
                alerts.append("Your rent spending is more than 50% of your income.")

        if category.category_name == "Entertainment" and budget.net_income > 0:
            percent_of_income = (spent / budget.net_income) * 100
            if percent_of_income > 20:
                alerts.append("Your entertainment spending looks quite high.")

    if calculate_remaining_income(budget) < 0:
        alerts.append("You have spent more than your monthly income.")

    return alerts


def calculate_financial_snapshot_score(budget):
    # generates user's budget health score out of 100
    score = 100

    net_income = budget.net_income
    remaining = calculate_remaining_income(budget)
    total_saved = calculate_total_saved(budget.user)
    categories = Category.objects.filter(budget=budget)

    rent_spent = Decimal("0.00")
    entertainment_spent = Decimal("0.00")

    # remaining income ratio
    if net_income > 0:
        remaining_ratio = remaining / net_income
        if remaining_ratio < 0:
            score -= 30
        elif remaining_ratio < Decimal("0.1"):
            score -= 15
        elif remaining_ratio < Decimal("0.2"):
            score -= 5

    # per category overspend ratio
    for category in categories:
        spent = calculate_category_spent(category)

        if category.limit_amount and spent > category.limit_amount:
            overspend_ratio = (spent - category.limit_amount) / category.limit_amount
            score -= min(20, float(overspend_ratio * 20))

        if category.category_name == "Rent":
            rent_spent = spent

        if category.category_name == "Entertainment":
            entertainment_spent = spent

    # rent burden ratio
    if net_income > 0:
        if rent_spent / net_income > Decimal("0.5"):
            score -= 15
        elif rent_spent / net_income > Decimal("0.35"):
            score -= 8

        if entertainment_spent / net_income > Decimal("0.2"):
            score -= 8

    if total_saved > 0:
        score += 5

    score = max(0, min(100, round(score)))
    return score


def generate_budget_summary(budget):
    # creates short personalised summary of the user's budget status
    remaining = calculate_remaining_income(budget)
    total_spent = calculate_total_spent(budget)
    total_saved = calculate_total_saved(budget.user)
    alerts = check_overspending_alerts(budget)
    score = calculate_financial_snapshot_score(budget)

    summary_parts = [f"You have spent £{total_spent:.2f} this month."]

    if total_saved > 0:
        summary_parts.append(f"You have put £{total_saved:.2f} into savings goals.")

    if remaining > 0:
        summary_parts.append(f"You have £{remaining:.2f} left.")
    elif remaining == 0:
        summary_parts.append("You have used all of your monthly income.")
    else:
        summary_parts.append(f"You are over budget by £{abs(remaining):.2f}.")

    if score >= 80:
        summary_parts.append("Your budget looks healthy overall.")
    elif score >= 50:
        summary_parts.append("Your budget is okay, but there is room for improvement.")
    else:
        summary_parts.append("Your budget needs attention.")

    if alerts:
        summary_parts.extend(alerts)

    return " ".join(summary_parts)
