import json
from math import floor
import requests
from core.settings import *
from .models import *
from django.core.files.storage import default_storage
import logging

from oauth2_provider.models import Application, AccessToken, RefreshToken
from oauth2_provider.settings import oauth2_settings
from oauth2_provider.views.mixins import OAuthLibMixin
from oauthlib.oauth2.rfc6749.errors import (
    InvalidClientError,
    UnsupportedGrantTypeError,
    AccessDeniedError,
    MissingClientIdError,
    InvalidRequestError,
)

from rest_framework.request import Request

from django.core.mail import EmailMessage
from django.http import HttpRequest
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError, force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator

        
        
        
 
class TokenManager(OAuthLibMixin):
    """
    Implements an endpoint to provide access tokens

    The endpoint is used in the following flows:

    * Authorization code
    * Password
    * Client credentials
    """

    server_class = oauth2_settings.OAUTH2_SERVER_CLASS
    validator_class = oauth2_settings.OAUTH2_VALIDATOR_CLASS
    oauthlib_backend_class = oauth2_settings.OAUTH2_BACKEND_CLASS
    
    # To Obtain Token from Oauth create_token method
    def __request_token(self, request: Request, payload):
        
        httpRequest = request._request
        httpRequest.POST = httpRequest.POST.copy() # mutabel copy
        httpRequest.POST.clear()
        httpRequest.POST.update(**payload)
        print(httpRequest.POST)
        
        try:
            url, headers, body, status = self.create_token_response(httpRequest)
        except AccessToken.DoesNotExist:
            return None
        
        
        tokenDict = json.loads(body)
        print(tokenDict)
        return tokenDict

        
    def get_token(self, request: Request, email, password):
        
        payload = {
                   'username': email,
                   'password': password,
                   'client_id': DEFAULT_AUTH_CLIENT_KEY,
                   'client_secret': DEFAULT_AUTH_CLIENT_SECRET,
                   'grant_type':'password'
               }
        
        return self.__request_token(request, payload)
        
        
    @staticmethod
    def check_reset_token_uid(uid, token):
        try:
            user_id = smart_str(urlsafe_base64_decode(uid))
            user = UserModel.objects.get(id = user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                return None
        
        except DjangoUnicodeDecodeError as ex:
            return None
            
        return user
    
    @staticmethod
    def create_reset_token_uid(user: UserModel):
        uid = urlsafe_base64_encode(force_bytes(user.id))
        print("Encoded UID: ", uid)
        token = PasswordResetTokenGenerator().make_token(user)
        print("Token Generated: ", token)
        
        return uid, token
        
class FileManager:
    @staticmethod
    def exists(filepath):
        return default_storage.exists(filepath)
    
    @staticmethod
    def save(filepath, file):
        return default_storage.save(filepath, file)
    
    @staticmethod
    def delete(filepath):
        return default_storage.delete(filepath)
    
    @staticmethod
    def open(filepath, mode = "rb"):
        return default_storage.open(filepath, mode)
    
    @staticmethod
    def url(filepath):
        return default_storage.url(filepath)
    
class DataDumper:
    @staticmethod
    def dump_to_file(filename, data):
        with FileManager.open(f"debug/{filename}", "tw+") as fp:
            json.dump(data, fp, indent=4)
            
        
            
class ModelExistenceChecker:
    @staticmethod
    def chapter_verifier(request, episode_id, chapter_id):
        current_user = request.user
        
        episode_model = EpisodeModel.objects.filter(
            id=episode_id, 
            # user=current_user
        ).first()
        if episode_model is None:
            return {"data": "Episode Not Found!", "status": 404}

        chapter_model = ChapterModel.objects.filter(id = chapter_id, episode=episode_model).first()
        if chapter_model is None:
            return {"data": "Chapter Not Found!", "status": 404}
        
        return [episode_model, chapter_model]
    
    @staticmethod
    def reel_verifier(request, episode_id, chapter_id, reel_id):
        current_user = request.user

        episode_model = EpisodeModel.objects.filter(
            id=episode_id, 
            # user=current_user
        ).first()
        if episode_model is None:
            return {"data": "Episode Not Found!", "status": 404}

        chapter_model = ChapterModel.objects.filter(id = chapter_id, episode=episode_model).first()
        if chapter_model is None:
            return {"data": "Chapter Not Found!", "status": 404}
        
        reel_model = ReelModel.objects.filter(id = reel_id).first()
        if reel_model is None:
            return {"data": "Reel Not Found!", "status": 404}
        
        return [episode_model, chapter_model, reel_model]
    
    
class UTIL:
    @staticmethod
    def send_email(data):
        email = EmailMessage(
            subject=data['subject'],
            body=data['body'],
            from_email=EMAIL_HOST_USER,
            to=[data["to_email"]],
        )
        email.send()
        
    @staticmethod
    def convert_time_string_to_seconds(timeString):
        hours, minutes, seconds, frames = timeString.split(":")
        return (int(hours) * 3600) + (int(minutes) * 60) + int(seconds) + (int(frames) / 30)
    
    @staticmethod
    def convert_seconds_to_time_string(totalSeconds, isShort = True):
        hours = floor(totalSeconds / 3600)
        minutes = floor((totalSeconds % 3600) / 60)
        seconds = floor(totalSeconds % 60)
        frames = floor((totalSeconds % 1) * 30) # Assuming 30 frames per second
        
        if isShort:        
            return ':'.join([
                str(hours),
                str(minutes),
                str(seconds),
            ])
                
        return ':'.join([
                f'{hours:0>2}',
                f'{minutes:0>2}',
                f'{seconds:0>2}',
                f'{frames:0>2}',
            ])