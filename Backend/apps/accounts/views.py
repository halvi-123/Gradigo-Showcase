from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    RegisterSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            )
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"})
        except Exception:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "user_id": user.user_id,
                "email": user.email,
                "full_name": user.full_name,
                "created_at": user.created_at,
            }
        )

class ForgotPasswordView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)

            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)

            reset_url = (
                f"{settings.FRONTEND_URL}/reset-password/{uidb64}/{token}"
            )

            send_mail(
                subject="Reset your password",
                message=(
                    "Use the link below to reset your password:\n\n"
                    f"{reset_url}"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except User.DoesNotExist:
            pass

        return Response(
            {
                "message": (
                    "If an account with that email exists, "
                    "a reset link has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )

class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        new_password = serializer.validated_data["password"]

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password reset successfully"},
            status=status.HTTP_200_OK,
        )