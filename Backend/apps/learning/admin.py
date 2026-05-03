from django.contrib import admin
from .models import (
    Answer,
    Question,
    Quiz,
    QuizAttempt,
    Category,
)


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 2


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("title", "difficulty")
    list_filter = ("difficulty",)
    search_fields = ("title",)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "category", "difficulty")
    list_filter = ("category", "difficulty")
    search_fields = ("text",)

    inlines = [AnswerInline]

    fieldsets = (
        (None, {"fields": ("text", "category", "difficulty", "explanation", "tip")}),
    )


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "quiz", "score", "passed", "completed_at")
    list_filter = ("passed", "quiz")
