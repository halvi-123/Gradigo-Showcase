from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Article, Question, Quiz, Video
from .serializers import (
    ArticleSerializer,
    QuestionSerializer,
    QuizSerializer,
    VideoSerializer,
)
from .services import get_dashboard, mark_article_complete, submit_quiz

from django.shortcuts import get_object_or_404


class StatusResponseSerializer(serializers.Serializer):
    status = serializers.CharField()


class QuizSubmitRequestSerializer(serializers.Serializer):
    answers = serializers.DictField()


class QuizSubmitResponseSerializer(serializers.Serializer):
    attempt_id = serializers.IntegerField()
    score = serializers.FloatField()
    passed = serializers.BooleanField()
    results = serializers.ListField()


class DashboardResponseSerializer(serializers.Serializer):
    completed_articles = serializers.IntegerField(required=False)
    total_articles = serializers.IntegerField(required=False)
    completed_quizzes = serializers.IntegerField(required=False)
    total_quizzes = serializers.IntegerField(required=False)
    progress_percentage = serializers.FloatField(required=False)
    quiz_scores = serializers.ListField(child=serializers.DictField(), required=False)


class ArticleListView(generics.ListAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

    @extend_schema(
        responses={200: ArticleSerializer(many=True)},
        tags=["learning"],
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class VideoListView(generics.ListAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

    @extend_schema(
        responses={200: VideoSerializer(many=True)},
        tags=["learning"],
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class QuizByDifficultyView(generics.ListAPIView):
    serializer_class = QuizSerializer

    def get_queryset(self):
        difficulty = self.kwargs["difficulty"]
        return Quiz.objects.filter(difficulty=difficulty)

    @extend_schema(
        parameters=[
            OpenApiParameter("difficulty", str, OpenApiParameter.PATH),
        ],
        responses={200: QuizSerializer(many=True)},
        tags=["learning"],
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class QuestionsByFilterView(APIView):

    @extend_schema(
        parameters=[
            OpenApiParameter("category", str),
            OpenApiParameter("difficulty", str),
        ],
        responses={200: QuestionSerializer(many=True)},
        tags=["learning"],
    )
    def get(self, request):
        category = request.query_params.get("category")
        difficulty = request.query_params.get("difficulty")

        questions = Question.objects.all()

        if category:
            questions = questions.filter(
                category__name__iexact=category
            )

        valid_difficulties = ["easy", "medium", "hard"]

        if difficulty:
            if difficulty not in valid_difficulties:
                return Response(
                    {"error": "Invalid difficulty"},
                    status=400
                )

            questions = questions.filter(
                difficulty=difficulty
            )

        return Response(
            QuestionSerializer(
                questions,
                many=True
            ).data
        )


class CompleteArticleView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter("pk", int, OpenApiParameter.PATH),
        ],
        responses={200: StatusResponseSerializer},
        tags=["learning"],
    )
    def post(self, request, pk):
        # get the article or return 404 if not found
        article = get_object_or_404(Article, pk=pk)

        _, created = mark_article_complete(request.user, article)

        return Response({
            "status": "completed",
            "already_completed": not created,
            "article_id": article.id
        })


class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter("pk", int, OpenApiParameter.PATH),
        ],
        request=QuizSubmitRequestSerializer,
        responses={200: QuizSubmitResponseSerializer},
        tags=["learning"],
    )
    def post(self, request, pk):
        quiz = get_object_or_404(Quiz, pk=pk)

        answers = request.data.get("answers", {})

        attempt, results = submit_quiz(request.user, quiz, answers)

        return Response({
            "attempt_id": attempt.id,
            "score": attempt.score,
            "passed": attempt.passed,
            "results": results
        })


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: DashboardResponseSerializer},
        tags=["learning"],
    )
    def get(self, request):
        data = get_dashboard(request.user)
        return Response(data)
