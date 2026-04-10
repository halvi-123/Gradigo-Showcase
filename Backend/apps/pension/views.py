from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import PensionProjectionInputSerializer
from .services.pension import calculate_pension_projection


class PensionProjectionView(APIView):
    def post(self, request):
        serializer = PensionProjectionInputSerializer(data=request.data)
        if serializer.is_valid():
            result = calculate_pension_projection(**serializer.validated_data)
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
