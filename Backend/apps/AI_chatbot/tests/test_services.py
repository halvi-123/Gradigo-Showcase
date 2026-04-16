from unittest.mock import MagicMock, patch

import pytest

from apps.AI_chatbot.services.chat import get_groq_client, send_message


class TestGetGroqClient:
    def test_raises_error_when_no_api_key(self):
        with patch.dict("os.environ", {}, clear=True):
            with pytest.raises(ValueError, match="GROQ_API_KEY is not configured"):
                get_groq_client()

    def test_returns_client_when_api_key_set(self):
        with patch.dict("os.environ", {"GROQ_API_KEY": "test_key"}):
            with patch("apps.AI_chatbot.services.chat.Groq") as mock_groq:
                get_groq_client()
                mock_groq.assert_called_once_with(api_key="test_key")


class TestSendMessage:
    def test_returns_assistant_response(self):
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "This is a test response"

        with patch.dict("os.environ", {"GROQ_API_KEY": "test_key"}):
            with patch("apps.AI_chatbot.services.chat.Groq") as mock_groq:
                mock_groq.return_value.chat.completions.create.return_value = (
                    mock_response
                )
                result = send_message([], "Hello")
                assert result == "This is a test response"

    def test_raises_error_when_no_api_key(self):
        with patch.dict("os.environ", {}, clear=True):
            with pytest.raises(ValueError, match="GROQ_API_KEY is not configured"):
                send_message([], "Hello")

    def test_raises_error_when_api_fails(self):
        with patch.dict("os.environ", {"GROQ_API_KEY": "test_key"}):
            with patch("apps.AI_chatbot.services.chat.Groq") as mock_groq:
                mock_groq.return_value.chat.completions.create.side_effect = Exception(
                    "API error"
                )
                with pytest.raises(
                    Exception,
                    match="Chatbot is temporarily unavailable",
                ):
                    send_message([], "Hello")

    def test_passes_conversation_history(self):
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Response"

        history = [
            {"role": "user", "content": "Previous message"},
            {"role": "assistant", "content": "Previous response"},
        ]

        with patch.dict("os.environ", {"GROQ_API_KEY": "test_key"}):
            with patch("apps.AI_chatbot.services.chat.Groq") as mock_groq:
                mock_groq.return_value.chat.completions.create.return_value = (
                    mock_response
                )
                send_message(history, "New message")
                call_args = mock_groq.return_value.chat.completions.create.call_args
                messages = call_args[1]["messages"]
                assert any(m["content"] == "Previous message" for m in messages)
