from rest_framework.decorators import api_view
from rest_framework.response import Response
import base64
from rest_framework import viewsets, status  
from .models import ListData
from .serializers import ListDataSerializer
from django.views.decorators.csrf import csrf_exempt

# Imports for processing data
from .python_code.convert_to_networkx import convert_to_networkx  
from .python_code.cadCAD_model import cadCAD_model
from .python_code.draw_total_network import draw_total_network

import tempfile

@csrf_exempt
@api_view(['POST'])
def process_data(request):
  
  print("Running process data")

  data = request.data 

  G = convert_to_networkx(data)

  df = cadCAD_model(G, 0.05, 0.2)

  with tempfile.TemporaryDirectory() as tmpdir:
    image_path = draw_total_network(G, df, tmpdir + "/image.png")
    
    with open(image_path, "rb") as f:
      image_data = base64.b64encode(f.read()).decode('utf-8')

  return Response({"image": image_data})


class ListDataViewSet(viewsets.ModelViewSet):

  queryset = ListData.objects.all()
  serializer_class = ListDataSerializer

  def create(self, request, *args, **kwargs):

    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    self.perform_create(serializer)

    return Response(serializer.data)