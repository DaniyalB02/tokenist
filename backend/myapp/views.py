from rest_framework.decorators import api_view
from rest_framework.response import Response
import base64
from rest_framework import viewsets, status  
from .models import ListData
from .serializers import ListDataSerializer
from django.views.decorators.csrf import csrf_exempt

# Imports for processing data
from .python_code.convert_to_networkx import convert_to_networkx  
from .python_code.draw_total_network import draw_networkx
from .python_code.cadCAD_model import markov_chain_simulation

import tempfile
import matplotlib.pyplot as plt
from io import BytesIO
import networkx as nx
import io;
from django.http import HttpResponse
from django.http import JsonResponse

import io
import networkx as nx
import matplotlib.pyplot as plt

import io
import networkx as nx
import matplotlib.pyplot as plt

@csrf_exempt
@api_view(['POST'])
def process_data(request):
  
  print("Running process data")

  data = request.data 

  G = convert_to_networkx(data)

  df = markov_chain_simulation(G, 500)

  print(df.to_string(index=False))

  # Draw the NetworkX graph and save it as an image file
  image_path = "image.png"
  image_data = draw_networkx(G, df, image_save_path=image_path)

  # Encode the image as base64
  with open(image_path, "rb") as image_file:
      image_data = base64.b64encode(image_file.read()).decode('utf-8')


  # Return the base64-encoded image data in the JSON response
  return JsonResponse({"image": image_data})

  # print("Converted to networkx")

  # markov_chain_simulation(G, 500)

  # print("Ran markov chain simulation")

  # print(df.to_string(index=False))

  # with tempfile.TemporaryDirectory() as tmpdir:
  #   image_path = draw_total_network(G, df, tmpdir + "/image.png")
    
  #   with open(image_path, "rb") as f:
  #     image_data = base64.b64encode(f.read()).decode('utf-8')

  # # Plot the NetworkX graph
  # pos = nx.spring_layout(G)  # You may need to customize the layout
  # nx.draw(G, pos, with_labels=True, font_weight='bold', node_color='red')

  # # Save the plot to a BytesIO object
  # image_stream = BytesIO()
  # plt.savefig(image_stream, format='png')
  # plt.close()

  # # Get the base64-encoded image data
  # image_data = base64.b64encode(image_stream.getvalue()).decode('utf-8')

  # # Return the image data
  # return Response({"image": image_data})

class ListDataViewSet(viewsets.ModelViewSet):

  queryset = ListData.objects.all()
  serializer_class = ListDataSerializer

  def create(self, request, *args, **kwargs):

    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    self.perform_create(serializer)

    return Response(serializer.data)