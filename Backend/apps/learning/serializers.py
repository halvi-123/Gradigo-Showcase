from rest_framework import serializers
from .models import Answer, Question, Quiz, Article, Video, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)
    category = CategorySerializer()

    class Meta:
        model = Question
        fields = ["id", "text", "difficulty", "category", "answers"]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Quiz
        fields = ["id", "title", "difficulty", "questions"]


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = "__all__"


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = "__all__"


class DashboardSerializer(serializers.Serializer):
    completed_articles = serializers.IntegerField()
    total_articles = serializers.IntegerField()
    quizzes_taken = serializers.IntegerField()
    average_score = serializers.FloatField()
    difficulty_breakdown = serializers.DictField()
    difficulty_insight = serializers.DictField()
