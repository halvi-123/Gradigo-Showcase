from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.learning.models import (
    Article,
    Quiz,
    Question,
    Answer,
    Video,
    ArticleProgress,
    QuizAttempt,
)
from apps.learning.views import (
    ArticleListView,
    VideoListView,
    QuizByDifficultyView,
    CompleteArticleView,
    SubmitQuizView,
    DashboardView,
)

User = get_user_model()


class LearningViewTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self.user = User.objects.create_user(
            email="views@example.com",
            full_name="View User",
            password="password123",
        )

        self.article = Article.objects.create(
            title="Article 1",
            slug="article-1",
            content="Some content",
            external_url="https://example.com/article-1",
        )

        self.video = Video.objects.create(
            title="Video 1",
            youtube_url="https://youtube.com/watch?v=test",
            description="desc",
        )

        self.quiz_easy = Quiz.objects.create(title="Easy Quiz", difficulty="easy")
        self.quiz_medium = Quiz.objects.create(title="Medium Quiz", difficulty="medium")

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
            text="Ignoring money",
            is_correct=False,
        )

    def test_article_list_view_returns_articles(self):
        request = self.factory.get("/learning/articles/")
        response = ArticleListView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Article 1")

    def test_video_list_view_returns_videos(self):
        request = self.factory.get("/learning/videos/")
        response = VideoListView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Video 1")

    def test_quiz_by_difficulty_view_filters_quizzes(self):
        request = self.factory.get("/learning/quizzes/difficulty/easy/")
        response = QuizByDifficultyView.as_view()(request, difficulty="easy")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Easy Quiz")
        self.assertEqual(response.data[0]["difficulty"], "easy")

    def test_complete_article_view_requires_authentication(self):
        request = self.factory.post(f"/learning/articles/{self.article.id}/complete/")
        response = CompleteArticleView.as_view()(request, pk=self.article.id)

        self.assertEqual(response.status_code, 401)

    def test_complete_article_view_marks_progress_when_authenticated(self):
        request = self.factory.post(f"/learning/articles/{self.article.id}/complete/")
        force_authenticate(request, user=self.user)

        response = CompleteArticleView.as_view()(request, pk=self.article.id)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "completed")
        self.assertTrue(
            ArticleProgress.objects.filter(
                user=self.user,
                article=self.article,
                completed=True,
            ).exists()
        )

    def test_submit_quiz_view_requires_authentication(self):
        request = self.factory.post(
            f"/learning/quizzes/{self.quiz_easy.id}/submit/",
            {"answers": {str(self.question.id): self.correct_answer.id}},
            format="json",
        )
        response = SubmitQuizView.as_view()(request, pk=self.quiz_easy.id)

        self.assertEqual(response.status_code, 401)

    def test_submit_quiz_view_returns_score_and_passed(self):
        request = self.factory.post(
            f"/learning/quizzes/{self.quiz_easy.id}/submit/",
            {"answers": {str(self.question.id): self.correct_answer.id}},
            format="json",
        )
        force_authenticate(request, user=self.user)

        response = SubmitQuizView.as_view()(request, pk=self.quiz_easy.id)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["score"], 100)
        self.assertTrue(response.data["passed"])
        self.assertEqual(QuizAttempt.objects.count(), 1)

    def test_submit_quiz_view_returns_failed_for_wrong_answer(self):
        request = self.factory.post(
            f"/learning/quizzes/{self.quiz_easy.id}/submit/",
            {"answers": {str(self.question.id): self.wrong_answer.id}},
            format="json",
        )
        force_authenticate(request, user=self.user)

        response = SubmitQuizView.as_view()(request, pk=self.quiz_easy.id)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["score"], 0)
        self.assertFalse(response.data["passed"])
        self.assertEqual(QuizAttempt.objects.count(), 1)

    def test_dashboard_view_requires_authentication(self):
        request = self.factory.get("/learning/dashboard/")
        response = DashboardView.as_view()(request)

        self.assertEqual(response.status_code, 401)

    def test_dashboard_view_returns_aggregated_progress(self):
        ArticleProgress.objects.create(
            user=self.user,
            article=self.article,
            completed=True,
        )
        QuizAttempt.objects.create(
            user=self.user,
            quiz=self.quiz_easy,
            score=90,
            passed=True,
        )

        request = self.factory.get("/learning/dashboard/")
        force_authenticate(request, user=self.user)

        response = DashboardView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["completed_articles"], 1)
        self.assertEqual(response.data["total_articles"], 1)
        self.assertEqual(response.data["quizzes_taken"], 1)
        self.assertEqual(response.data["average_score"], 90)