from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Article(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    # optional inline fallback
    content = models.TextField(blank=True)

    # primary usage
    external_url = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Quiz(models.Model):

    class Difficulty(models.TextChoices):
        EASY = "easy", "Easy"
        MEDIUM = "medium", "Medium"
        HARD = "hard", "Hard"

    title = models.CharField(max_length=255)
    difficulty = models.CharField(
        max_length=10, choices=Difficulty.choices, default=Difficulty.EASY
    )

    def __str__(self):
        return f"{self.title} ({self.difficulty})"


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()

    def __str__(self):
        return self.text


class Answer(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="answers"
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)


class Video(models.Model):
    title = models.CharField(max_length=255)
    youtube_url = models.URLField()
    description = models.TextField(blank=True)

    def __str__(self):
        return self.title


class ArticleProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "article")


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField()
    passed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now_add=True)
