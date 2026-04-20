from django.shortcuts import get_object_or_404

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, SavingsGoal, Transaction
from .serializers import (
    BudgetSerializer,
    CategorySerializer,
    CategoryUpdateSerializer,
    SavingsGoalSerializer,
    TransactionSerializer,
)
from .services import (
    calculate_category_breakdown,
    calculate_financial_snapshot_score,
    calculate_remaining_income,
    calculate_total_saved,
    calculate_total_spent,
    check_overspending_alerts,
    create_default_categories,
    generate_budget_summary,
    get_or_create_budget,
)


class DashboardResponseSerializer(serializers.Serializer):
    budget = BudgetSerializer()
    remaining_income = serializers.FloatField()
    total_spent = serializers.FloatField()
    total_saved = serializers.FloatField()
    alerts = serializers.ListField(child=serializers.CharField())
    category_breakdown = serializers.ListField(child=serializers.DictField())
    financial_snapshot_score = serializers.IntegerField()
    summary = serializers.CharField()


class TransactionListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: TransactionSerializer(many=True)},
        tags=["budget"],
    )
    def get(self, request):
        budget = get_or_create_budget(request.user, 0)
        transactions = Transaction.objects.filter(budget=budget)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @extend_schema(
        request=TransactionSerializer,
        responses={201: TransactionSerializer},
        tags=["budget"],
    )
    def post(self, request):
        budget = get_or_create_budget(request.user, 0)
        serializer = TransactionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(budget=budget)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(Transaction, pk=pk, budget__user=user)

    @extend_schema(
        parameters=[
            OpenApiParameter("pk", int, OpenApiParameter.PATH),
        ],
        responses={200: TransactionSerializer},
        tags=["budget"],
    )
    def get(self, request, pk):
        transaction = self.get_object(pk, request.user)
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)

    @extend_schema(
        parameters=[
            OpenApiParameter("pk", int, OpenApiParameter.PATH),
        ],
        request=TransactionSerializer,
        responses={200: TransactionSerializer},
        tags=["budget"],
    )
    def put(self, request, pk):
        transaction = self.get_object(pk, request.user)
        serializer = TransactionSerializer(transaction, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        parameters=[
            OpenApiParameter("pk", int, OpenApiParameter.PATH),
        ],
        responses={204: None},
        tags=["budget"],
    )
    def delete(self, request, pk):
        transaction = self.get_object(pk, request.user)
        transaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SavingsGoalListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: SavingsGoalSerializer(many=True)},
        tags=["budget"],
    )
    def get(self, request):
        savings_goals = SavingsGoal.objects.filter(user=request.user)
        serializer = SavingsGoalSerializer(savings_goals, many=True)
        return Response(serializer.data)

    @extend_schema(
        request=SavingsGoalSerializer,
        responses={201: SavingsGoalSerializer},
        tags=["budget"],
    )
    def post(self, request):
        serializer = SavingsGoalSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SavingsGoalDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(SavingsGoal, pk=pk, user=user)

    @extend_schema(
        parameters=[
            OpenApiParameter("pk", int, OpenApiParameter.PATH),
        ],
        responses={200: SavingsGoalSerializer},
        tags=["budget"],
    )
    def get(self, request, pk):
        savings_goal = self.get_object(pk, request.user)
        serializer = SavingsGoalSerializer(savings_goal)
        return Response(serializer.data)

    @extend_schema(
        parameters=[
            OpenApiParameter("pk", int, OpenApiParameter.PATH),
        ],
        request=SavingsGoalSerializer,
        responses={200: SavingsGoalSerializer},
        tags=["budget"],
    )
    def put(self, request, pk):
        savings_goal = self.get_object(pk, request.user)
        serializer = SavingsGoalSerializer(savings_goal, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        parameters=[
            OpenApiParameter("pk", int, OpenApiParameter.PATH),
        ],
        responses={204: None},
        tags=["budget"],
    )
    def delete(self, request, pk):
        savings_goal = self.get_object(pk, request.user)
        savings_goal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BudgetDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: BudgetSerializer},
        tags=["budget"],
    )
    def get(self, request):
        budget = get_or_create_budget(request.user, 0)
        create_default_categories(budget)
        serializer = BudgetSerializer(budget)
        return Response(serializer.data)

    @extend_schema(
        request=BudgetSerializer,
        responses={200: BudgetSerializer},
        tags=["budget"],
    )
    def put(self, request):
        budget = get_or_create_budget(request.user, 0)
        create_default_categories(budget)
        serializer = BudgetSerializer(budget, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save(user=request.user, month=budget.month)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(
            Category,
            pk=pk,
            budget__user=user,
        )

    @extend_schema(
        parameters=[
            OpenApiParameter("pk", int, OpenApiParameter.PATH),
        ],
        request=CategoryUpdateSerializer,
        responses={200: CategorySerializer},
        tags=["budget"],
    )
    def put(self, request, pk):
        category = self.get_object(pk, request.user)
        serializer = CategoryUpdateSerializer(category, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(CategorySerializer(category).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        parameters=[
            OpenApiParameter("pk", int, OpenApiParameter.PATH),
        ],
        request=CategoryUpdateSerializer,
        responses={200: CategorySerializer},
        tags=["budget"],
    )
    def patch(self, request, pk):
        category = self.get_object(pk, request.user)
        serializer = CategoryUpdateSerializer(category, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(CategorySerializer(category).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BudgetDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: DashboardResponseSerializer},
        tags=["budget"],
    )
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
