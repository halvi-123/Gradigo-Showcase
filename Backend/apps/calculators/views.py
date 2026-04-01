from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import SalaryInputSerializer
from .services.salary import calculate_salary_breakdown


class SalaryCalculateView(APIView):
    def post(self, request):
        serializer = SalaryInputSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = calculate_salary_breakdown(**serializer.validated_data)
        return Response(result, status=status.HTTP_200_OK)