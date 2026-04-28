import json
import os
from django.core.management.base import BaseCommand
from Backend.first_job_navigator import settings
from learning.models import Quiz, Question, Answer, Category


class Command(BaseCommand):
    help = "Load quiz data from JSON file"

    def handle(self, *args, **kwargs):

        # 1. Open JSON file
        file_path = os.path.join(
            settings.BASE_DIR, "learning", "data", "quiz_data.json"
        )

        with open(file_path) as f:
            data = json.load(f)

        # 2. Create Quiz
        quiz = Quiz.objects.create(
            title=data["quiz_title"], difficulty="easy"  # you can adjust this
        )

        # 3. Loop through questions
        for q in data["questions"]:

            # Create or get category
            category_obj, _ = Category.objects.get_or_create(name=q["category"])

            # Create question
            question = Question.objects.create(
                quiz=quiz,
                text=q["text"],
                difficulty=q["difficulty"],
                category=category_obj,
                explanation=q.get("explanation", ""),
                tip=q.get("tip", ""),
            )

            # 4. Create answers
            for a in q["answers"]:
                Answer.objects.create(
                    question=question, text=a["text"], is_correct=a["is_correct"]
                )

        self.stdout.write(self.style.SUCCESS("✅ Quiz data loaded successfully"))
