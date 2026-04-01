from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import Category, Transaction, SavingsGoal

from .serializers import BudgetSerializer, CategorySerializer, TransactionSerializer, SavingsGoalSerializer, CategoryUpdateSerializer

from .services import (
    get_or_create_budget,
    create_default_categories,
    calculate_remaining_income,
    calculate_total_spent,
    calculate_total_saved,
    calculate_category_breakdown,
    check_overspending_alerts,
    calculate_financial_snapshot_score,
    generate_budget_summary,
)

# Transaction List and Create View
class TransactionListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        budget = get_or_create_budget(request.user, 0)
        transactions = Transaction.objects.filter(budget=budget)
        serializer = TransactionSerializer(transactions, many=True)

        return Response(serializer.data)

    def post(self, request):
        budget = get_or_create_budget(request.user, 0)
        serializer = TransactionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(budget=budget)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Transaction Detail CRUD
class TransactionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(
            Transaction,
            pk=pk,
            budget__user=user
        )

    def get(self, request, pk):
        transaction = self.get_object(pk, request.user)
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)

    def put(self, request, pk):
        transaction = self.get_object(pk, request.user)
        serializer = TransactionSerializer(transaction, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        transaction = self.get_object(pk, request.user)
        transaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

#Savings Goal List/Create View
class SavingsGoalListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        savings_goals = SavingsGoal.objects.filter(user=request.user)
        serializer = SavingsGoalSerializer(savings_goals, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SavingsGoalSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Savings Goal Detail CRUD
class SavingsGoalDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(
            SavingsGoal,
            pk=pk,
            user=user
        )

    def get(self, request, pk):
        savings_goal = self.get_object(pk, request.user)
        serializer = SavingsGoalSerializer(savings_goal)
        return Response(serializer.data)

    def put(self, request, pk):
        savings_goal = self.get_object(pk, request.user)
        serializer = SavingsGoalSerializer(savings_goal, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        savings_goal = self.get_object(pk, request.user)
        savings_goal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
#budget detail view
class BudgetDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        budget = get_or_create_budget(request.user, 0)
        create_default_categories(budget)
        serializer = BudgetSerializer(budget)
        return Response(serializer.data)
    
    def put(self, request):
        budget = get_or_create_budget(request.user, 0)
        create_default_categories(budget)
        serializer = BudgetSerializer(budget, data=request.data, partial = True)

        if serializer.is_valid():
            serializer.save(user=request.user, month=budget.month)
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# category update views
class CategoryUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(
            Category,
            pk=pk,
            budget__user=user,
        )

    def put(self, request, pk):
        category = self.get_object(pk, request.user)
        serializer = CategoryUpdateSerializer(category, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(CategorySerializer(category).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        category = self.get_object(pk, request.user)
        serializer = CategoryUpdateSerializer(category, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(CategorySerializer(category).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#budget dashboard views
class BudgetDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        budget = get_or_create_budget(request.user, 0)
        create_default_categories(budget)

        data = {
            "budget": BudgetSerializer(budget).data,
            "remaining_income": float(calculate_remaining_income(budget)),
            "total_spent": float(calculate_total_spent(budget)),
            "total_saved": float(calculate_total_saved(request.user)),
            "alerts": check_overspending_alerts(budget),
            "category_breakdown": calculate_category_breakdown(budget),
            "financial_snapshot_score": calculate_financial_snapshot_score(budget),
            "summary": generate_budget_summary(budget),
        }

        return Response(data)