from django.urls import path
from .views import (
    ArticleListView,
    VideoListView,
    QuizByDifficultyView,
    CompleteArticleView,
    SubmitQuizView,
    DashboardView,
)

urlpatterns = [
    path("articles/", ArticleListView.as_view()),
    path("videos/", VideoListView.as_view()),
    path("quizzes/difficulty/<str:difficulty>/",
         QuizByDifficultyView.as_view()),
    path("articles/<int:pk>/complete/", CompleteArticleView.as_view()),
    path("quizzes/<int:pk>/submit/", SubmitQuizView.as_view()),
    path("dashboard/", DashboardView.as_view()),
]
