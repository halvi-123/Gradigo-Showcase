from django.db.models import Avg
from .models import ArticleProgress, Answer, QuizAttempt, Article
from django.db.models import Max

PASS_MARK = 70


def mark_article_complete(user, article):
    progress, created = ArticleProgress.objects.get_or_create(
        user=user, article=article
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

        results.append(
            {
                "question": question.text,
                "correct": is_correct,
                "correct_answer": correct_answer.text,
                "explanation": question.explanation,
            }
        )

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
    from .models import Quiz

    total_articles = Article.objects.count()
    completed_articles = ArticleProgress.objects.filter(
        user=user, completed=True
    ).count()

    completed_article_ids = list(
        ArticleProgress.objects.filter(user=user, completed=True).values_list(
            "article_id", flat=True
        )
    )

    total_quizzes = Quiz.objects.count()

    attempts = QuizAttempt.objects.filter(user=user)
    completed_quizzes = attempts.filter(passed=True).count()

    avg_score = attempts.aggregate(Avg("score"))["score__avg"] or 0

    progress_percentage = (
        (completed_quizzes / total_quizzes * 100) if total_quizzes > 0 else 0
    )

    latest_attempts = (
        attempts.values("quiz_id")
        .annotate(score=Max("score"))
        .values("quiz_id", "score")
    )

    quiz_scores = list(latest_attempts)

    return {
        "completed_articles": completed_articles,
        "total_articles": total_articles,
        "completed_article_ids": completed_article_ids,
        "completed_quizzes": completed_quizzes,
        "total_quizzes": total_quizzes,
        "progress_percentage": progress_percentage,
        "average_score": round(avg_score, 1),
        "quiz_scores": quiz_scores,
    }
