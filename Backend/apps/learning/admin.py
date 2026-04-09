from django.contrib import admin
from .models import Answer, Question, Quiz, Article, Video, ArticleProgress, QuizAttempt


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 2


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("title", "difficulty")


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    inlines = [AnswerInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "quiz", "score", "passed", "completed_at")


admin.site.register(Article)
admin.site.register(Video)
admin.site.register(ArticleProgress)