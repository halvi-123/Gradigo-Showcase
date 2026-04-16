import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.AI_chatbot.models import ChatSession, ChatMessage

User = get_user_model()


@pytest.mark.django_db
class TestChatSessionListCreateView:
    def test_list_chat_sessions_for_authenticated_user(self):
        client = APIClient()

        user = User.objects.create_user(
            email="view1@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        other_user = User.objects.create_user(
            email="view2@example.com",
            full_name="Other User",
            password="securepassword123",
        )

        session1 = ChatSession.objects.create(user=user)
        session2 = ChatSession.objects.create(user=user)
        ChatSession.objects.create(user=other_user)

        client.force_authenticate(user=user)
        response = client.get("/api/chatbot/sessions/")

        assert response.status_code == 200
        assert len(response.data) == 2
        returned_ids = [session["session_id"] for session in response.data]
        assert session1.session_id in returned_ids
        assert session2.session_id in returned_ids

    def test_create_chat_session_for_authenticated_user(self):
        client = APIClient()

        user = User.objects.create_user(
            email="view3@example.com",
            full_name="Test User",
            password="securepassword123",
        )

        client.force_authenticate(user=user)
        response = client.post("/api/chatbot/sessions/")

        assert response.status_code == 201
        assert response.data["user"] == user.pk
        assert ChatSession.objects.filter(user=user).count() == 1

    def test_chat_session_list_requires_authentication(self):
        client = APIClient()

        response = client.get("/api/chatbot/sessions/")

        assert response.status_code == 401


@pytest.mark.django_db
class TestChatSessionDetailView:
    def test_get_specific_chat_session_for_authenticated_user(self):
        client = APIClient()

        user = User.objects.create_user(
            email="view4@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        client.force_authenticate(user=user)
        response = client.get(f"/api/chatbot/sessions/{session.session_id}/")

        assert response.status_code == 200
        assert response.data["session_id"] == session.session_id
        assert response.data["user"] == user.pk

    def test_get_chat_session_returns_404_for_wrong_user(self):
        client = APIClient()

        user = User.objects.create_user(
            email="view5@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        other_user = User.objects.create_user(
            email="view6@example.com",
            full_name="Other User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=other_user)

        client.force_authenticate(user=user)
        response = client.get(f"/api/chatbot/sessions/{session.session_id}/")

        assert response.status_code == 404
        assert response.data["detail"] == "Chat session not found."

    def test_chat_session_detail_requires_authentication(self):
        client = APIClient()

        user = User.objects.create_user(
            email="view7@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        response = client.get(f"/api/chatbot/sessions/{session.session_id}/")

        assert response.status_code == 401


@pytest.mark.django_db
class TestChatMessageListView:
    def test_list_messages_in_chat_session(self):
        client = APIClient()

        user = User.objects.create_user(
            email="view8@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        ChatMessage.objects.create(
            session=session,
            role="user",
            content="Hello",
        )
        ChatMessage.objects.create(
            session=session,
            role="assistant",
            content="Hi there",
        )

        client.force_authenticate(user=user)
        response = client.get(
            f"/api/chatbot/sessions/{session.session_id}/messages/"
        )

        assert response.status_code == 200
        assert len(response.data) == 2
        assert response.data[0]["role"] == "user"
        assert response.data[1]["role"] == "assistant"

    def test_list_messages_returns_404_for_wrong_user_session(self):
        client = APIClient()

        user = User.objects.create_user(
            email="view9@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        other_user = User.objects.create_user(
            email="view10@example.com",
            full_name="Other User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=other_user)

        client.force_authenticate(user=user)
        response = client.get(
            f"/api/chatbot/sessions/{session.session_id}/messages/"
        )

        assert response.status_code == 404
        assert response.data["detail"] == "Chat session not found."

    def test_chat_message_list_requires_authentication(self):
        client = APIClient()

        user = User.objects.create_user(
            email="view11@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        response = client.get(f"/api/chatbot/sessions/{session.session_id}/messages/")

        assert response.status_code == 401


@pytest.mark.django_db
class TestSendMessageView:
    def test_send_message_creates_user_and_assistant_messages(self, monkeypatch):
        client = APIClient()

        user = User.objects.create_user(
            email="view12@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        def mock_send_message(conversation_history, user_message):
            return "This is a mocked assistant reply"

        monkeypatch.setattr(
            "apps.AI_chatbot.views.send_message",
            mock_send_message,
        )

        client.force_authenticate(user=user)
        response = client.post(
            f"/api/chatbot/sessions/{session.session_id}/send/",
            {"content": "What is a pension?"},
            format="json",
        )

        assert response.status_code == 201
        assert response.data["user_message"]["role"] == "user"
        assert response.data["user_message"]["content"] == "What is a pension?"
        assert response.data["assistant_message"]["role"] == "assistant"
        assert (
            response.data["assistant_message"]["content"]
            == "This is a mocked assistant reply"
        )
        assert ChatMessage.objects.filter(session=session).count() == 2

    def test_send_message_returns_404_for_wrong_user_session(self, monkeypatch):
        client = APIClient()

        user = User.objects.create_user(
            email="view13@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        other_user = User.objects.create_user(
            email="view14@example.com",
            full_name="Other User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=other_user)

        def mock_send_message(conversation_history, user_message):
            return "This should not be used"

        monkeypatch.setattr(
            "apps.AI_chatbot.views.send_message",
            mock_send_message,
        )

        client.force_authenticate(user=user)
        response = client.post(
            f"/api/chatbot/sessions/{session.session_id}/send/",
            {"content": "Hello"},
            format="json",
        )

        assert response.status_code == 404
        assert response.data["detail"] == "Chat session not found."

    def test_send_message_rejects_empty_content(self, monkeypatch):
        client = APIClient()

        user = User.objects.create_user(
            email="view15@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        def mock_send_message(conversation_history, user_message):
            return "This should not be used"

        monkeypatch.setattr(
            "apps.AI_chatbot.views.send_message",
            mock_send_message,
        )

        client.force_authenticate(user=user)
        response = client.post(
            f"/api/chatbot/sessions/{session.session_id}/send/",
            {"content": ""},
            format="json",
        )

        assert response.status_code == 400
        assert "content" in response.data

    def test_send_message_requires_authentication(self):
        client = APIClient()

        user = User.objects.create_user(
            email="view16@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        response = client.post(
            f"/api/chatbot/sessions/{session.session_id}/send/",
            {"content": "Hello"},
            format="json",
        )

        assert response.status_code == 401

    def test_send_message_returns_500_when_groq_key_missing(self, monkeypatch):
        client = APIClient()

        user = User.objects.create_user(
            email="view17@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        def mock_send_message(conversation_history, user_message):
            raise ValueError("GROQ_API_KEY is not configured")

        monkeypatch.setattr(
            "apps.AI_chatbot.views.send_message",
            mock_send_message,
        )

        client.force_authenticate(user=user)
        response = client.post(
            f"/api/chatbot/sessions/{session.session_id}/send/",
            {"content": "Hello"},
            format="json",
        )

        assert response.status_code == 500
        assert response.data["detail"] == "GROQ_API_KEY is not configured"

    def test_send_message_returns_503_when_service_fails(self, monkeypatch):
        client = APIClient()

        user = User.objects.create_user(
            email="view18@example.com",
            full_name="Test User",
            password="securepassword123",
        )
        session = ChatSession.objects.create(user=user)

        def mock_send_message(conversation_history, user_message):
            raise Exception(
                "Chatbot is temporarily unavailable, please try again later"
            )

        monkeypatch.setattr(
            "apps.AI_chatbot.views.send_message",
            mock_send_message,
        )

        client.force_authenticate(user=user)
        response = client.post(
            f"/api/chatbot/sessions/{session.session_id}/send/",
            {"content": "Hello"},
            format="json",
        )

        assert response.status_code == 503
        assert (
            response.data["detail"]
            == "Chatbot is temporarily unavailable, please try again later"
        )
