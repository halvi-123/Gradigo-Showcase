import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.learning.models import Article, Video


class Command(BaseCommand):
    help = "Load articles and videos from JSON files"

    def handle(self, *args, **kwargs):
        self.load_articles()
        self.load_videos()

    def load_articles(self):
        file_path = os.path.join(
            settings.BASE_DIR, "apps", "learning", "data", "article_data.json"
        )

        with open(file_path) as f:
            data = json.load(f)

        for article_data in data["articles"]:
            article, created = Article.objects.get_or_create(
                slug=article_data["slug"],
                defaults={
                    "title": article_data["title"],
                    "content": article_data.get("content", ""),
                    "external_url": article_data.get("external_url", ""),
                },
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Loaded article: {article_data['title']}")
                )
            else:
                self.stdout.write(f"Skipped (already exists): {article_data['title']}")

        self.stdout.write(self.style.SUCCESS("All articles loaded successfully"))

    def load_videos(self):
        file_path = os.path.join(
            settings.BASE_DIR, "apps", "learning", "data", "video_data.json"
        )

        with open(file_path) as f:
            data = json.load(f)

        for video_data in data["videos"]:
            video, created = Video.objects.get_or_create(
                youtube_url=video_data["youtube_url"],
                defaults={
                    "title": video_data["title"],
                    "description": video_data.get("description", ""),
                },
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Loaded video: {video_data['title']}")
                )
            else:
                self.stdout.write(f"Skipped (already exists): {video_data['title']}")

        self.stdout.write(self.style.SUCCESS("All videos loaded successfully"))
