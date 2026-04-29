from django.utils import timezone
from django.db.models import Avg
from .models import ArticleProgress, Answer, QuizAttempt, Article

PASS_MARK = 70


def mark_article_complete(user, article):
    progress, created = ArticleProgress.objects.get_or_create(
        user=user,
        article=article
    )

    if not progress.completed:
        progress.completed = True
        progress.save()

    return progress, created


def calculate_quiz_score(quiz, submitted_answers):
    total = 0
    correct = 0

    for question in quiz.questions.all():
        total += 1
        answer_id = submitted_answers.get(str(question.id))

        if (
            answer_id
            and Answer.objects.filter(
                id=answer_id, question=question, is_correct=True
            ).exists()
        ):
            correct += 1

    return (correct / total) * 100 if total else 0


def submit_quiz(user, quiz, answers):
    questions = quiz.questions.all()

    total = 0
    correct = 0
    results = []

    for question in questions:
        selected_id = answers.get(str(question.id))
        correct_answer = question.answers.filter(is_correct=True).first()

        # skip if no correct answer defined
        if not correct_answer:
            continue

        total += 1

        is_correct = False
        if selected_id is not None and str(selected_id) == str(correct_answer.id):
            is_correct = True

        if is_correct:
            correct += 1

        results.append({
            "question": question.text,
            "correct": is_correct,
            "correct_answer": correct_answer.text,
            "explanation": question.explanation,
        })

    score = 0
    if total > 0:
        score = (correct / total) * 100

    attempt = QuizAttempt.objects.create(
        user=user,
        quiz=quiz,
        score=score,
        passed=score >= PASS_MARK,
    )

    return attempt, results


def get_dashboard(user):
    total_articles = Article.objects.count()

    completed_articles = ArticleProgress.objects.filter(
        user=user, completed=True
    ).count()

    attempts = QuizAttempt.objects.filter(user=user)

    quizzes_taken = attempts.count()

    avg_score = attempts.aggregate(Avg("score"))["score__avg"] or 0

    easy_avg = attempts.filter(quiz__difficulty="easy").aggregate(
        Avg("score")
    )["score__avg"] or 0

    medium_avg = attempts.filter(quiz__difficulty="medium").aggregate(
        Avg("score")
    )["score__avg"] or 0

    hard_avg = attempts.filter(quiz__difficulty="hard").aggregate(
        Avg("score")
    )["score__avg"] or 0

    # store scores
    difficulty_scores = {
        "easy": easy_avg,
        "medium": medium_avg,
        "hard": hard_avg
    }

    if quizzes_taken == 0:
        strongest = None
        weakest = None
    else:
        strongest = max(difficulty_scores, key=difficulty_scores.get)
        weakest = min(difficulty_scores, key=difficulty_scores.get)

    return {
        "completed_articles": completed_articles,
        "total_articles": total_articles,
        "quizzes_taken": quizzes_taken,
        "average_score": avg_score,
        "difficulty_breakdown": difficulty_scores,
        "difficulty_insight": {
            "strongest": strongest,
            "weakest": weakest,
        },
    }
