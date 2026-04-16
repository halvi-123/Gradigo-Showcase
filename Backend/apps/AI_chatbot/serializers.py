from rest_framework import serializers

from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            "message_id",
            "session",
            "role",
            "content",
            "created_at",
        ]
        read_only_fields = [
            "message_id",
            "created_at",
        ]


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = [
            "session_id",
            "user",
            "created_at",
            "updated_at",
            "messages",
        ]
        read_only_fields = [
            "session_id",
            "user",
            "created_at",
            "updated_at",
        ]


class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField()

    def validate_content(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Message can not be empty")

        return value
