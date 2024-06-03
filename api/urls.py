from django.urls import path
from . import views

from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path("tester", views.Tester.as_view(), name="api.tester"),
    
    path("auth/register", views.UserRegistrationApi.as_view(), name="api.auth.register"),
    path("auth/login", views.UserLoginApi.as_view(), name="api.auth.login"),
    path("auth/change/password", views.UserPasswordChangeApi.as_view(), name="api.auth.changePassword"),
    path("auth/forgot", views.UserPasswordForgotApi.as_view(), name="api.auth.forgot"),
    path("auth/reset/<str:uid>/<str:token>", views.UserPasswordResetApi.as_view(), name="api.auth.reset"),
    
    path("auth/profile", views.UserProfileUpdateApi.as_view(), name="api.auth.profile"),
    
    
    path("episodes/add", views.EpisodeSheetApi.as_view(), name="api.episodes.add"),
    
    path("episodes", views.EpisodeListApi.as_view(), name="api.episodes.list"),
    path("episodes/<str:uid>", views.EpisodeDetailApi.as_view(), name="api.episodes.detail"),
    
    path("chapters/<str:episode_id>", views.ChapterListApi.as_view(), name="api.chapters.list"),
    path("chapters/<str:episode_id>/<str:uid>", views.ChapterDetailApi.as_view(), name="api.chapters.detail"),
    
    
    
]

urlpatterns = format_suffix_patterns(urlpatterns)
