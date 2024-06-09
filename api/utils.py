from math import floor
from django.core.mail import EmailMessage
from core.settings import *

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