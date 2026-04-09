from django.utils import timezone
from django.db.models import Avg
from .models import ArticleProgress, Answer, QuizAttempt, Article

PASS_MARK = 70

def mark_article_complete(user, article):
    progress, _ = ArticleProgress.objects.get_or_create(
        user=user,
        article=article
    )

    progress.completed = True
    progress.completed_at = timezone.now()
    progress.save()

    return progress


def calculate_quiz_score(quiz, submitted_answers):
    total = 0
    correct = 0

    for question in quiz.questions.all():
        total += 1
        answer_id = submitted_answers.get(str(question.id))

        if answer_id and Answer.objects.filter(
            id=answer_id,
            question=question,
            is_correct=True
        ).exists():
            correct += 1

    return (correct / total) * 100 if total else 0


def submit_quiz(user, quiz, answers):
    score = calculate_quiz_score(quiz, answers)

    passed = score >= PASS_MARK

    return QuizAttempt.objects.create(
        user=user,
        quiz=quiz,
        score=score,
        passed=passed,
    )


def get_dashboard(user):
    total_articles = Article.objects.count()

    completed_articles = ArticleProgress.objects.filter(
        user=user,
        completed=True
    ).count()

    quizzes_taken = QuizAttempt.objects.filter(
        user=user
    ).count()

    avg_score = QuizAttempt.objects.filter(
        user=user
    ).aggregate(
        Avg("score")
    )["score__avg"] or 0

    return {
        "completed_articles": completed_articles,
        "total_articles": total_articles,
        "quizzes_taken": quizzes_taken,
        "average_score": avg_score
    }