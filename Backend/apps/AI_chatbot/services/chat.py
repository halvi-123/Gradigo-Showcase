import os
from groq import Groq

SYSTEM_PROMPT = (
    "You are a helpful financial assistant for First Job Navigator, "
    "a platform designed to help young professionals understand their finances "
    "when starting their first job. You can help users understand topics such as: "
    "salary and tax calculations, budgeting and expense tracking, pension "
    "contributions and projections, moving out costs and affordability, and "
    "general UK financial literacy. Keep your responses clear, concise and "
    "appropriate for someone new to managing their own finances. If a question "
    "is outside the scope of personal finance and the First Job Navigator "
    "platform, politely redirect the user back to relevant financial topics."
)


def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured")
    return Groq(api_key=api_key)


def send_message(conversation_history: list, user_message: str) -> str:
    """
    Send a message to the Groq API and return the assistant's response.
    conversation_history: list of previous messages in format
    [{"role": "user/assistant", "content": "..."}]
    user_message: the new message from the user
    """
    try:
        client = get_groq_client()

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        messages.extend(conversation_history)
        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )

        return response.choices[0].message.content

    except ValueError as e:
        raise ValueError(str(e))

    except Exception:
        raise Exception("Chatbot is temporarily unavailable, please try again later")
