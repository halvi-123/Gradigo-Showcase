from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.learning.models import (
    Article,
    Quiz,
    Question,
    Answer,
    Video,
    ArticleProgress,
    QuizAttempt,
)

User = get_user_model()


class LearningAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            email="api@example.com",
            full_name="API User",
            password="password123",
        )

        self.article = Article.objects.create(
            title="Article 1",
            slug="article-1",
            content="Article content",
            external_url="https://example.com/article",
        )

        self.video = Video.objects.create(
            title="Video 1",
            youtube_url="https://youtube.com/watch?v=abc",
            description="Video description",
        )

        self.quiz_easy = Quiz.objects.create(title="Easy Quiz", difficulty="easy")
        self.quiz_hard = Quiz.objects.create(title="Hard Quiz", difficulty="hard")

        self.question = Question.objects.create(
            quiz=self.quiz_easy,
            text="What is budgeting?",
        )
        self.correct_answer = Answer.objects.create(
            question=self.question,
            text="Managing money",
            is_correct=True,
        )
        self.wrong_answer = Answer.objects.create(
            question=self.question,
            text="Ignoring bills",
            is_correct=False,
        )

    def test_get_articles_endpoint(self):
        response = self.client.get("/api/learning/articles/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Article 1")

    def test_get_videos_endpoint(self):
        response = self.client.get("/api/learning/videos/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Video 1")

    def test_get_quizzes_by_difficulty_endpoint(self):
        response = self.client.get("/api/learning/quizzes/difficulty/easy/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Easy Quiz")
        self.assertEqual(response.data[0]["difficulty"], "easy")

    def test_complete_article_endpoint_requires_auth(self):
        response = self.client.post(
            f"/api/learning/articles/{self.article.id}/complete/"
        )

        self.assertEqual(response.status_code, 401)

    def test_complete_article_endpoint_success(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            f"/api/learning/articles/{self.article.id}/complete/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "completed")
        self.assertTrue(
            ArticleProgress.objects.filter(
                user=self.user,
                article=self.article,
                completed=True,
            ).exists()
        )

    def test_learning_progress_persists_across_sessions(self):
        self.client.force_authenticate(user=self.user)

        complete_response = self.client.post(
            f"/api/learning/articles/{self.article.id}/complete/"
        )

        self.assertEqual(complete_response.status_code, 200)

        self.client.force_authenticate(user=None)

        self.client.force_authenticate(user=self.user)

        dashboard_response = self.client.get("/api/learning/dashboard/")

        self.assertEqual(dashboard_response.status_code, 200)
        self.assertEqual(dashboard_response.data["completed_articles"], 1)
        self.assertEqual(dashboard_response.data["total_articles"], 1)
        self.assertTrue(
            ArticleProgress.objects.filter(
                user=self.user,
                article=self.article,
                completed=True,
            ).exists()
        )

    def test_submit_quiz_endpoint_requires_auth(self):
        response = self.client.post(
            f"/api/learning/quizzes/{self.quiz_easy.id}/submit/",
            {"answers": {str(self.question.id): self.correct_answer.id}},
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_submit_quiz_endpoint_success_for_correct_answer(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            f"/api/learning/quizzes/{self.quiz_easy.id}/submit/",
            {"answers": {str(self.question.id): self.correct_answer.id}},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["score"], 100)
        self.assertTrue(response.data["passed"])
        self.assertEqual(QuizAttempt.objects.count(), 1)

    def test_submit_quiz_endpoint_success_for_wrong_answer(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            f"/api/learning/quizzes/{self.quiz_easy.id}/submit/",
            {"answers": {str(self.question.id): self.wrong_answer.id}},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["score"], 0)
        self.assertFalse(response.data["passed"])
        self.assertEqual(QuizAttempt.objects.count(), 1)

    def test_dashboard_endpoint_requires_auth(self):
        response = self.client.get("/api/learning/dashboard/")
        self.assertEqual(response.status_code, 401)

    def test_dashboard_endpoint_returns_expected_data(self):
        self.client.force_authenticate(user=self.user)

        ArticleProgress.objects.create(
            user=self.user,
            article=self.article,
            completed=True,
        )
        QuizAttempt.objects.create(
            user=self.user,
            quiz=self.quiz_easy,
            score=85,
            passed=True,
        )

        response = self.client.get("/api/learning/dashboard/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["completed_articles"], 1)
        self.assertEqual(response.data["total_articles"], 1)
        self.assertEqual(response.data["quizzes_taken"], 1)
        self.assertEqual(response.data["average_score"], 85)
