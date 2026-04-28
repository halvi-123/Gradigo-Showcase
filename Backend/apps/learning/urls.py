from django.urls import path
from .views import (
    QuestionsByFilterView,
    ArticleListView,
    VideoListView,
    QuizListView,
    CompleteArticleView,
    SubmitQuizView,
    DashboardView,
)

urlpatterns = [
    path("questions/", QuestionsByFilterView.as_view()),
    path("articles/", ArticleListView.as_view()),
    path("videos/", VideoListView.as_view()),
    path("quizzes/", QuizListView.as_view()),
    path("articles/<int:pk>/complete/", CompleteArticleView.as_view()),
    path("quizzes/<int:pk>/submit/", SubmitQuizView.as_view()),
    path("dashboard/", DashboardView.as_view()),
]
