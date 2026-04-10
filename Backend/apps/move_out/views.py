from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .serializers import MoveOutCheckSerializer, MoveOutPlanSerializer
from .services import save_move_out_plan, get_saved_move_out_plan, MoveOutServiceError

class MoveOutCheckView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        plan = get_saved_move_out_plan(request.user)

        if not plan:
            return Response(
                {"detail": "No saved move out plan found for this user"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = MoveOutPlanSerializer(plan)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MoveOutCheckSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = save_move_out_plan(
                user=request.user,
                postcode=serializer.validated_data["postcode"],
                monthly_income=serializer.validated_data["monthly_income"],
                monthly_expenses=serializer.validated_data["monthly_expenses"],
            )
        except MoveOutServiceError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        response_serializer = MoveOutPlanSerializer(plan)
        return Response(response_serializer.data, status=status.HTTP_200_OK)