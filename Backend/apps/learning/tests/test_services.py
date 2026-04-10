from django.test import TestCase
from django.contrib.auth import get_user_model

from apps.learning.models import (
    Article,
    Quiz,
    Question,
    Answer,
    ArticleProgress,
    QuizAttempt,
)
from apps.learning.services import (
    mark_article_complete,
    calculate_quiz_score,
    submit_quiz,
    get_dashboard,
)

User = get_user_model()


class LearningServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="services@example.com",
            full_name="Service User",
            password="password123",
        )

        self.article1 = Article.objects.create(
            title="Article 1",
            slug="article-1",
            content="Article 1 content",
        )
        self.article2 = Article.objects.create(
            title="Article 2",
            slug="article-2",
            content="Article 2 content",
        )

        self.quiz = Quiz.objects.create(title="Quiz 1", difficulty="easy")

        self.q1 = Question.objects.create(quiz=self.quiz, text="Question 1?")
        self.q2 = Question.objects.create(quiz=self.quiz, text="Question 2?")

        self.a1_correct = Answer.objects.create(
            question=self.q1,
            text="Correct 1",
            is_correct=True,
        )
        self.a1_wrong = Answer.objects.create(
            question=self.q1,
            text="Wrong 1",
            is_correct=False,
        )
        self.a2_correct = Answer.objects.create(
            question=self.q2,
            text="Correct 2",
            is_correct=True,
        )
        self.a2_wrong = Answer.objects.create(
            question=self.q2,
            text="Wrong 2",
            is_correct=False,
        )

    def test_mark_article_complete_creates_progress(self):
        progress = mark_article_complete(self.user, self.article1)

        self.assertTrue(progress.completed)
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(
            ArticleProgress.objects.filter(user=self.user, article=self.article1).count(),
            1,
        )

    def test_mark_article_complete_updates_existing_progress_not_duplicate(self):
        ArticleProgress.objects.create(
            user=self.user,
            article=self.article1,
            completed=False,
        )

        progress = mark_article_complete(self.user, self.article1)

        self.assertTrue(progress.completed)
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(
            ArticleProgress.objects.filter(user=self.user, article=self.article1).count(),
            1,
        )

    def test_calculate_quiz_score_returns_100_for_all_correct(self):
        submitted_answers = {
            str(self.q1.id): self.a1_correct.id,
            str(self.q2.id): self.a2_correct.id,
        }

        score = calculate_quiz_score(self.quiz, submitted_answers)
        self.assertEqual(score, 100)

    def test_calculate_quiz_score_returns_50_for_half_correct(self):
        submitted_answers = {
            str(self.q1.id): self.a1_correct.id,
            str(self.q2.id): self.a2_wrong.id,
        }

        score = calculate_quiz_score(self.quiz, submitted_answers)
        self.assertEqual(score, 50)

    def test_calculate_quiz_score_returns_0_when_no_answers(self):
        score = calculate_quiz_score(self.quiz, {})
        self.assertEqual(score, 0)

    def test_submit_quiz_creates_attempt_and_sets_pass_true(self):
        submitted_answers = {
            str(self.q1.id): self.a1_correct.id,
            str(self.q2.id): self.a2_correct.id,
        }

        attempt = submit_quiz(self.user, self.quiz, submitted_answers)

        self.assertEqual(attempt.score, 100)
        self.assertTrue(attempt.passed)
        self.assertEqual(QuizAttempt.objects.count(), 1)

    def test_submit_quiz_creates_attempt_and_sets_pass_false_below_pass_mark(self):
        submitted_answers = {
            str(self.q1.id): self.a1_correct.id,
            str(self.q2.id): self.a2_wrong.id,
        }

        attempt = submit_quiz(self.user, self.quiz, submitted_answers)

        self.assertEqual(attempt.score, 50)
        self.assertFalse(attempt.passed)
        self.assertEqual(QuizAttempt.objects.count(), 1)

    def test_get_dashboard_returns_expected_aggregates(self):
        mark_article_complete(self.user, self.article1)

        QuizAttempt.objects.create(
            user=self.user,
            quiz=self.quiz,
            score=80,
            passed=True,
        )
        QuizAttempt.objects.create(
            user=self.user,
            quiz=self.quiz,
            score=60,
            passed=False,
        )

        dashboard = get_dashboard(self.user)

        self.assertEqual(dashboard["completed_articles"], 1)
        self.assertEqual(dashboard["total_articles"], 2)
        self.assertEqual(dashboard["quizzes_taken"], 2)
        self.assertEqual(dashboard["average_score"], 70)

    def test_get_dashboard_returns_zero_average_when_no_attempts(self):
        dashboard = get_dashboard(self.user)

        self.assertEqual(dashboard["completed_articles"], 0)
        self.assertEqual(dashboard["total_articles"], 2)
        self.assertEqual(dashboard["quizzes_taken"], 0)
        self.assertEqual(dashboard["average_score"], 0)