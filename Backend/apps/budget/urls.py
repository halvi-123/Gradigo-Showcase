from django.urls import path
from .views import (
    TransactionListCreateView,
    TransactionDetailView,
    SavingsGoalListCreateView,
    SavingsGoalDetailView
)

urlpatterns = [
    # Transaction URLs
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),

    # Savings Goal URLs
    path('savings-goals/', SavingsGoalListCreateView.as_view(), name='savings-goal-list-create'),
    path('savings-goals/<int:pk>/', SavingsGoalDetailView.as_view(), name='savings-goal-detail'),
]