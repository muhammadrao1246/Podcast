from django.urls import path
from . import views

from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    
    path("", views.Tester.as_view()),
    path("auth/register", views.UserRegistrationApi.as_view()),
    path("auth/login", views.UserLoginApi.as_view()),
    path("auth/change/password", views.UserPasswordChangeApi.as_view()),
    path("auth/forgot", views.UserPasswordForgotApi.as_view()),
    path("auth/reset/<str:uid>/<str:token>", views.UserPasswordResetApi.as_view()),
    path("auth/profile", views.UserProfileUpdateApi.as_view()),
    
    path("episodes/add", views.EpisodeSheetApi.as_view()),
    path("episodes", views.EpisodeListApi.as_view()),
    path("episodes/<str:uid>", views.EpisodeDetailApi.as_view()),
    
    path("episodes/<str:episode_id>/chapters", views.ChapterListApi.as_view()),
    path("episodes/<str:episode_id>/chapters/<str:uid>", views.ChapterDetailApi.as_view()),
        
    path("episodes/<str:episode_id>/chapters/<str:chapter_id>/reels", views.ReelListApi.as_view()),
    path("episodes/<str:episode_id>/chapters/<str:chapter_id>/reels/<str:uid>", views.ReelDetailApi.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
