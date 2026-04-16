import pytest
from django.contrib.auth import get_user_model

from apps.AI_chatbot.models import ChatSession, ChatMessage
from apps.AI_chatbot.serializers import (
    ChatSessionSerializer,
    ChatMessageSerializer,
    SendMessageSerializer,
)

User = get_user_model()


@pytest.mark.django_db
class TestChatMessageSerializer:
    def test_chat_message_serializer_fields(self):
        user = User.objects.create_user(
            email="serializer1@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)
        message = ChatMessage.objects.create(
            session=session,
            role="user",
            content="Hello there",
        )

        serializer = ChatMessageSerializer(message)

        assert serializer.data["message_id"] == message.message_id
        assert serializer.data["session"] == session.session_id
        assert serializer.data["role"] == "user"
        assert serializer.data["content"] == "Hello there"
        assert serializer.data["created_at"] is not None

    def test_chat_message_serializer_read_only_fields(self):
        user = User.objects.create_user(
            email="serializer2@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        data = {
            "message_id": 999,
            "session": session.session_id,
            "role": "assistant",
            "content": "Test assistant message",
        }

        serializer = ChatMessageSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_chat_message_serializer_invalid_without_content(self):
        user = User.objects.create_user(
            email="serializer3@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        data = {
            "session": session.session_id,
            "role": "user",
            "content": "",
        }
        serializer = ChatMessageSerializer(data=data)
        assert not serializer.is_valid()
        assert "content" in serializer.errors


@pytest.mark.django_db
class TestChatSessionSerializer:
    def test_chat_session_serializer_fields(self):
        user = User.objects.create_user(
            email="serializer4@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        ChatMessage.objects.create(
            session=session,
            role="user",
            content="First message",
        )
        ChatMessage.objects.create(
            session=session,
            role="assistant",
            content="Second message",
        )

        serializer = ChatSessionSerializer(session)

        assert serializer.data["session_id"] == session.session_id
        assert serializer.data["user"] == user.pk
        assert serializer.data["created_at"] is not None
        assert serializer.data["updated_at"] is not None
        assert len(serializer.data["messages"]) == 2

    def test_chat_session_serializer_contains_nested_messages(self):
        user = User.objects.create_user(
            email="serializer5@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        message = ChatMessage.objects.create(
            session=session,
            role="user",
            content="Nested message test",
        )

        serializer = ChatSessionSerializer(session)

        assert serializer.data["messages"][0]["message_id"] == message.message_id
        assert serializer.data["messages"][0]["role"] == "user"
        assert serializer.data["messages"][0]["content"] == "Nested message test"


@pytest.mark.django_db
class TestSendMessageSerializer:
    def test_send_message_serializer_valid_data(self):
        data = {
            "content": "What is National Insurance?",
        }

        serializer = SendMessageSerializer(data=data)

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["content"] == "What is National Insurance?"

    def test_send_message_serializer_rejects_empty_message(self):
        data = {
            "content": "",
        }

        serializer = SendMessageSerializer(data=data)

        assert not serializer.is_valid()
        assert "content" in serializer.errors

    def test_send_message_serializer_rejects_whitespace_only_message(self):
        data = {
            "content": "     ",
        }

        serializer = SendMessageSerializer(data=data)

        assert not serializer.is_valid()
        assert "content" in serializer.errors

    def test_send_message_serializer_strips_whitespace(self):
        data = {
            "content": "   Explain budgeting simply   ",
        }

        serializer = SendMessageSerializer(data=data)

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["content"] == "Explain budgeting simply"
