from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Article, Video, Quiz
from .serializers import ArticleSerializer, VideoSerializer, QuizSerializer
from .services import get_dashboard, mark_article_complete, submit_quiz


class ArticleListView(generics.ListAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer


class VideoListView(generics.ListAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer


class QuizByDifficultyView(generics.ListAPIView):
    serializer_class = QuizSerializer

    def get_queryset(self):
        difficulty = self.kwargs["difficulty"]
        return Quiz.objects.filter(difficulty=difficulty)


class CompleteArticleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        article = Article.objects.get(pk=pk)
        mark_article_complete(request.user, article)

        return Response({"status": "completed"})


class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        quiz = Quiz.objects.get(pk=pk)
        answers = request.data.get("answers", {})

        attempt = submit_quiz(request.user, quiz, answers)

        return Response({"score": attempt.score, "passed": attempt.passed})


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = get_dashboard(request.user)
        return Response(data)