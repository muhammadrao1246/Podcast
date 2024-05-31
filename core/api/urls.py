from django.urls import path
from . import views

from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    # path("header/data/", views.HeaderData, name="api.header.data"),
    
    
]

urlpatterns = format_suffix_patterns(urlpatterns)
