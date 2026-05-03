import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.learning.models import Quiz, Question, Answer, Category


class Command(BaseCommand):
    help = "Load quiz data from JSON file"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(
            settings.BASE_DIR, "apps", "learning", "data", "quiz_data.json"
        )

        with open(file_path) as f:
            data = json.load(f)

        for quiz_data in data["quizzes"]:
            quiz = Quiz.objects.create(
                title=quiz_data["title"],
                difficulty=quiz_data["difficulty"],
            )

            for q in quiz_data["questions"]:
                category_obj, _ = Category.objects.get_or_create(name=q["category"])

                question = Question.objects.create(
                    quiz=quiz,
                    text=q["text"],
                    difficulty=quiz_data["difficulty"],
                    category=category_obj,
                    explanation=q.get("explanation", ""),
                    tip=q.get("tip", ""),
                )

                for a in q["answers"]:
                    Answer.objects.create(
                        question=question,
                        text=a["text"],
                        is_correct=a["is_correct"],
                    )

            self.stdout.write(self.style.SUCCESS(f"Loaded quiz: {quiz_data['title']}"))

        self.stdout.write(self.style.SUCCESS("All quizzes loaded successfully"))
