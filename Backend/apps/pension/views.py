from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import PensionProjectionInputSerializer
from .services.pension import calculate_pension_projection


class PensionProjectionOutputSerializer(serializers.Serializer):
    yearly_breakdown = serializers.ListField(child=serializers.DictField())
    low_projection = serializers.FloatField()
    mid_projection = serializers.FloatField()
    high_projection = serializers.FloatField()
    low_projection_today_money = serializers.FloatField()
    mid_projection_today_money = serializers.FloatField()
    high_projection_today_money = serializers.FloatField()


class PensionProjectionView(APIView):
    @extend_schema(
        request=PensionProjectionInputSerializer,
        responses={200: PensionProjectionOutputSerializer},
        tags=["pension"],
    )
    def post(self, request):
        serializer = PensionProjectionInputSerializer(data=request.data)
        if serializer.is_valid():
            result = calculate_pension_projection(**serializer.validated_data)
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
