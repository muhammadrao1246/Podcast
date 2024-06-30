from math import floor
from django.core.mail import EmailMessage
from core.settings import *
from .models import *
from django.core.files.storage import default_storage

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