from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SalaryCalculation
from .serializers import SalaryInputSerializer
from .services.salary import calculate_salary_breakdown


class SalaryCalculateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SalaryInputSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        result = calculate_salary_breakdown(**data)

        SalaryCalculation.objects.create(
            user=request.user,
            gross_salary=data["gross_salary"],
            pension_percent=data.get("pension_percent", 0),
            student_loan_plan=data.get("student_loan_plan"),
            tax_region=data.get("tax_region", "england"),
            income_tax=result["income_tax"],
            national_insurance=result["national_insurance"],
            student_loan=result["student_loan"],
            pension=result["pension"],
            total_deductions=result["total_deductions"],
            net_annual=result["net_annual"],
            net_monthly=result["net_monthly"],
        )

        return Response(result, status=status.HTTP_200_OK)
