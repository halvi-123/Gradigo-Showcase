from django.test import TestCase

from apps.learning.models import Article, Quiz, Question, Answer, Video
from apps.learning.serializers import (
    AnswerSerializer,
    QuestionSerializer,
    QuizSerializer,
    ArticleSerializer,
    VideoSerializer,
    DashboardSerializer,
)


class LearningSerializerTests(TestCase):
    def setUp(self):
        self.article = Article.objects.create(
            title="Article 1",
            slug="article-1",
            content="Article content",
            external_url="https://example.com/article-1",
        )

        self.video = Video.objects.create(
            title="Video 1",
            youtube_url="https://youtube.com/watch?v=abc",
            description="Video description",
        )

        self.quiz = Quiz.objects.create(title="Quiz 1", difficulty="easy")
        self.question = Question.objects.create(
            quiz=self.quiz,
            text="What is budgeting?",
        )
        self.answer1 = Answer.objects.create(
            question=self.question,
            text="Managing money",
            is_correct=True,
        )
        self.answer2 = Answer.objects.create(
            question=self.question,
            text="Ignoring bills",
            is_correct=False,
        )

    def test_answer_serializer_fields(self):
        data = AnswerSerializer(self.answer1).data

        self.assertEqual(set(data.keys()), {"id", "text"})
        self.assertEqual(data["text"], "Managing money")

    def test_question_serializer_nests_answers(self):
        data = QuestionSerializer(self.question).data

        self.assertEqual(data["text"], "What is budgeting?")
        self.assertEqual(len(data["answers"]), 2)
        self.assertIn("id", data["answers"][0])
        self.assertIn("text", data["answers"][0])

    def test_quiz_serializer_nests_questions_and_answers(self):
        data = QuizSerializer(self.quiz).data

        self.assertEqual(data["title"], "Quiz 1")
        self.assertEqual(data["difficulty"], "easy")
        self.assertEqual(len(data["questions"]), 1)
        self.assertEqual(data["questions"][0]["text"], "What is budgeting?")
        self.assertEqual(len(data["questions"][0]["answers"]), 2)

    def test_article_serializer_returns_all_fields(self):
        data = ArticleSerializer(self.article).data

        self.assertEqual(data["title"], "Article 1")
        self.assertEqual(data["slug"], "article-1")
        self.assertEqual(data["content"], "Article content")
        self.assertEqual(data["external_url"], "https://example.com/article-1")

    def test_video_serializer_returns_all_fields(self):
        data = VideoSerializer(self.video).data

        self.assertEqual(data["title"], "Video 1")
        self.assertEqual(data["youtube_url"],
                         "https://youtube.com/watch?v=abc")
        self.assertEqual(data["description"], "Video description")

    def test_dashboard_serializer_valid_data(self):
        payload = {
            "completed_articles": 3,
            "total_articles": 5,
            "quizzes_taken": 2,
            "average_score": 82.5,
        }

        serializer = DashboardSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data, payload)
