import pytest
from django.contrib.auth import get_user_model
from apps.AI_chatbot.models import ChatSession, ChatMessage

User = get_user_model()


@pytest.mark.django_db
class TestChatSessionModel:
    def test_create_chat_session(self):
        user = User.objects.create_user(
            email="test@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)
        assert session.session_id is not None
        assert session.user == user
        assert session.created_at is not None
        assert session.updated_at is not None

    def test_chat_session_str(self):
        user = User.objects.create_user(
            email="test2@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)
        assert str(session) == f"Session {session.session_id} - {user}"

    def test_deleting_user_deletes_session(self):
        user = User.objects.create_user(
            email="test3@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)
        user.delete()
        assert not ChatSession.objects.filter(session_id=session.session_id).exists()


@pytest.mark.django_db
class TestChatMessageModel:
    def test_create_chat_message(self):
        user = User.objects.create_user(
            email="test4@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)
        message = ChatMessage.objects.create(
            session=session,
            role="user",
            content="Hello how are you",
        )
        assert message.message_id is not None
        assert message.session == session
        assert message.role == "user"
        assert message.content == "Hello how are you"

    def test_chat_message_str(self):
        user = User.objects.create_user(
            email="test5@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)
        message = ChatMessage.objects.create(
            session=session,
            role="assistant",
            content="I am doing well thank you",
        )
        assert "assistant" in str(message)

    def test_deleting_session_deletes_messages(self):
        user = User.objects.create_user(
            email="test6@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)
        message = ChatMessage.objects.create(
            session=session,
            role="user",
            content="test message",
        )
        session.delete()
        assert not ChatMessage.objects.filter(message_id=message.message_id).exists()
