from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'listdata', views.ListDataViewSet)

urlpatterns = [
    path('listdata/', include(router.urls)),
    path('process_data/', views.process_data, name='process-data'),
]
