from decimal import Decimal
from datetime import date
from .models import Budget, Category, SavingsGoal

default_categories = [
    "Rent",
    "Bills",
    "Groceries",
    "Entertainment",
    "Subscriptions",
    "Transport",
]

def get_or_create_budget(user, net_income):
    #gets user's saved budget or creates it for first time
    today = date.today()
    first_day_of_month = today.replace(day=1)

    budget, created = Budget.objects.get_or_create(
        user=user,
        month=first_day_of_month,
        defaults={"net_income": net_income}
    )

    return budget

def create_default_categories(budget):
    #makes rent, bills, groceries etc..
    for name in default_categories:
        Category.objects.get_or_create(
            budget=budget,
            Category_name=name,
            defaults={"allocated_amount": Decimal("0.00")}
        )

def update_category_amount(budget, category_name, amount): 
    #updates category allocations
    category = Category.objects.get(budget=budget, category_name=category_name)
    category = category.allocated_amount = Decimal(str(amount))
    category.save()
    return category

def create_savings_goal(user, name, target_amount, current_amount = 0, target_date=None):
    #creates savings pots
    return SavingsGoal.objects.create(
        user=user,
        name=name,
        target_amount=Decimal(str(target_amount)),
        current_amount=Decimal(str(current_amount)),
        target_date=target_date
    )

def update_savings_goal(goal_id, name=None, target_amount=None, current_amount=None, target_date=None):
    #updates the savings pots values
    goal = SavingsGoal.objects.get(id=goal_id)

    if name is not None:
        goal.name = name
    if target_amount is not None:
        goal.target_amount = Decimal(str(target_amount))
    if current_amount is not None:
        goal.current_amount = Decimal(str(current_amount))
    if target_date is not None:
        goal.target_date = target_date

    goal.save()
    return goal

def calculate_total_allocated(budget):#total category allocations
    categories = Category.objects.filter(budget=budget)
    total = sum(category.allocated_amount for category in categories)
    return total

def calculate_remaining_income(budget):#shows money left
    total_allocated = calculate_total_allocated(budget)
    remaining = budget.net_income - total_allocated
    return remaining

def calculate_category_breakdown(budget):#gives chart percentages/data
    categories = Category.objects.filter(budget=budget)
    total_allocated = calculate_total_allocated(budget=budget)
    breakdown = []

    for category in categories:
        if total_allocated > 0:
            percentage = (category.allocated_amount / total_allocated) * 100
        else:
            percentage = 0

        breakdown.append({
            "category_name": category.category_name,
            "allocated_amount": float(category.allocated_amount),
            "percentage": round(float(percentage), 2)
        })

    return breakdown

def check_overspending_alerts(budget): #checks for overspending
    alerts = []
    categories = Category.objects.filter(budget=budget)

    for category in categories:
        if budget.net_income > 0:
            percent_of_income = (category.allocated_amount / budget.net_income) * 100
        else:
            percent_of_income = 0

        if category.category_name == "Rent" and percent_of_income > 50:
            alerts.append("Your rent is more than 50% of your income.")

        if category.category_name == "Entertainment" and percent_of_income > 20:
            alerts.append("Your entertainment spending looks quite high.")

        if category.allocated_amount < 0:
            alerts.append(f"{category.category_name} has an invalid amount.")

    if calculate_remaining_income(budget) < 0:
        alerts.append("You have allocated more than your monthly income.")

    return alerts


def calculate_financial_snapshot_score(budget): #generates financial snapshot score out of 100 for user
    score = 100
    remaining = calculate_remaining_income(budget)
    alerts = check_overspending_alerts(budget)

    if remaining < 0:
        score -= 40
    elif remaining == 0:
        score -= 10

    score -= len(alerts) * 10

    if score < 0:
        score = 0

    return score


def generate_budget_summary(budget): #Short personalized summary for user depending on their circumstances
    remaining = calculate_remaining_income(budget)
    alerts = check_overspending_alerts(budget)
    score = calculate_financial_snapshot_score(budget)

    summary_parts = []

    if remaining > 0:
        summary_parts.append(f"You have £{remaining:.2f} left after your allocations.")
    elif remaining == 0:
        summary_parts.append("You have allocated all of your monthly income.")
    else:
        summary_parts.append(f"You have gone over budget by £{abs(remaining):.2f}.")

    if score >= 80:
        summary_parts.append("Your budget looks healthy overall.")
    elif score >= 50:
        summary_parts.append("Your budget is okay, but there is room for improvement.")
    else:
        summary_parts.append("Your budget needs attention.")

    if alerts:
        summary_parts.extend(alerts)

    return " ".join(summary_parts)
