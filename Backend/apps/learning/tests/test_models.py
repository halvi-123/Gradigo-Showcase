from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError

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


class LearningModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="models@example.com",
            full_name="Model User",
            password="password123",
        )

    def test_article_str_returns_title(self):
        article = Article.objects.create(
            title="Budgeting Basics",
            slug="budgeting-basics",
            content="Learn budgeting.",
            external_url="https://example.com/budgeting",
        )
        self.assertEqual(str(article), "Budgeting Basics")

    def test_quiz_str_returns_title_and_difficulty(self):
        quiz = Quiz.objects.create(title="Tax Quiz", difficulty="easy")
        self.assertEqual(str(quiz), "Tax Quiz (easy)")

    def test_question_str_returns_text(self):
        quiz = Quiz.objects.create(title="Savings Quiz", difficulty="medium")
        question = Question.objects.create(quiz=quiz, text="What is saving?")
        self.assertEqual(str(question), "What is saving?")

    def test_video_str_returns_title(self):
        video = Video.objects.create(
            title="Intro to Pensions",
            youtube_url="https://youtube.com/watch?v=test",
            description="Pension basics",
        )
        self.assertEqual(str(video), "Intro to Pensions")

    def test_answer_defaults_to_not_correct(self):
        quiz = Quiz.objects.create(title="Quiz", difficulty="easy")
        question = Question.objects.create(quiz=quiz, text="Question?")
        answer = Answer.objects.create(question=question, text="Option A")

        self.assertFalse(answer.is_correct)

    def test_article_progress_unique_together_for_user_and_article(self):
        article = Article.objects.create(
            title="NI Basics",
            slug="ni-basics",
            content="National Insurance",
        )

        ArticleProgress.objects.create(
            user=self.user,
            article=article,
            completed=True,
        )

        with self.assertRaises(IntegrityError):
            ArticleProgress.objects.create(
                user=self.user,
                article=article,
                completed=False,
            )

    def test_quiz_attempt_creation(self):
        quiz = Quiz.objects.create(title="Loan Quiz", difficulty="hard")
        attempt = QuizAttempt.objects.create(
            user=self.user,
            quiz=quiz,
            score=75,
            passed=True,
        )

        self.assertEqual(attempt.user, self.user)
        self.assertEqual(attempt.quiz, quiz)
        self.assertEqual(attempt.score, 75)
        self.assertTrue(attempt.passed)
        self.assertIsNotNone(attempt.completed_at)