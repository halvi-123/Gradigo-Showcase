from django.urls import path

from .views import (
    ChatSessionListCreateView,
    ChatSessionDetailView,
    ChatMessageListView,
    SendMessageView,
)

urlpatterns = [
    path(
        "sessions/",
        ChatSessionListCreateView.as_view(),
        name="chat-session-list-create",
    ),
    path(
        "sessions/<int:session_id>/",
        ChatSessionDetailView.as_view(),
        name="chat-session-detail",
    ),
    path(
        "sessions/<int:session_id>/messages/",
        ChatMessageListView.as_view(),
        name="chat-message-list",
    ),
    path(
        "sessions/<int:session_id>/send/",
        SendMessageView.as_view(),
        name="chat-send-message",
    ),
]
