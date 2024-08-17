from django import db
from django.forms import ValidationError
from rest_framework import serializers

from django.utils import timezone

from django.db import DatabaseError, transaction
from django.db.models import QuerySet

from django.utils.encoding import smart_str, DjangoUnicodeDecodeError, force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator

from .sheets import GoogleSheetProcessor, DatabaseToGoogleSheetUpdater
from .utils import UTIL, FileManager

from .models import *
from core.settings import *

# Sheet Serializer
class SheetSerializer(serializers.Serializer):
    
    sheet_link = serializers.URLField(required=False)
    excel_file = serializers.FileField(required=False)
    
    project_link = serializers.URLField(required=True,error_messages={
                    'required': 'Project Link is required.',
                })
    
    class Meta:
        fields = ["sheet_url", "project_url", "excel_file"]
    
    def validate(self, attrs):
        
        # user = self.context.get("user")
        project_link = attrs["project_link"]
        sheet_link = attrs.get("sheet_link", None)
        excel_file = attrs.get("excel_file", None)
        if bool(sheet_link is not None) == bool(excel_file is not None):
            raise ValidationError("Only One Sheet URL or Excel File is required. ")
        elif sheet_link is not None:
            
            pr = GoogleSheetProcessor(sheet=sheet_link, project_url=project_link, isFile=False)
            
            print(pr.__str__())
            # pr.get_episode()
            pr.save_full_episode_series_sequence(
                # user
                )
            
        elif excel_file is not None:
            
            pr = GoogleSheetProcessor(sheet=excel_file, project_url=project_link, isFile=True)
            
            print(pr.__str__())
            # pr.get_episode()
            pr.save_full_episode_series_sequence(
                # user
                )
        
        return super().validate(attrs)

        
# EPISODE SEQUENCES SERIALIZER

class SequenceSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    
    words = serializers.CharField(required=True, max_length = 255, error_messages={
                    'required': 'Words is required.',
                    'max_length': 'Words must be less than 255 characters in length.',
                })
    sequence_number = serializers.IntegerField(required=True, error_messages={
                    'required': 'Sequence Number is required.',
                })
    
    start_time = serializers.CharField(required=True, error_messages={
                    'required': 'Start Time is required.',
                    'max_length': 'Start Time must be less than equal to 12 in length.',
                })
    end_time = serializers.CharField(required=True, error_messages={
                    'required': 'End Time is required.',
                    'max_length': 'End Time must be less than equal to 12 in length.',
                })
    
    num_start_time = serializers.SerializerMethodField()
    num_end_time = serializers.SerializerMethodField()
    class Meta:
        model = SequenceModel
        fields = ['id', 'words', 'sequence_number', 'num_start_time', 'num_end_time', 'start_time', 'end_time']

    def get_num_start_time(self, seq: SequenceModel):
        return UTIL.convert_time_string_to_seconds(seq.start_time)
    
    def get_num_end_time(self, seq: SequenceModel):
        return UTIL.convert_time_string_to_seconds(seq.end_time)

# EPISDOE SERIALIZER

class EpisodeListSerializer(serializers.ModelSerializer):
    content = serializers.SerializerMethodField()
    
    download_link = serializers.SerializerMethodField()
    class Meta:
        model = EpisodeModel
        fields = ['id', 'title', 'content', 'download_link', 'start_time', 'end_time', 'sheet_link', 'project_link']
        
    def get_content(self, episode: EpisodeModel):
        return episode.content[:100] + "..."
    
    
    def get_download_link(self, episode: EpisodeModel):
        if "episodes/" in episode.sheet_link:
            return FileManager.url(episode.sheet_link)
        return episode.sheet_link
        
        
class EpisodeDetailSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    
    title = serializers.CharField(required=True, max_length = 255, error_messages={
                    'required': 'Title is required.',
                    'max_length': 'Title must be less than 255 characters in length.',
                })
    content = serializers.CharField(required=True, error_messages={
                    'required': 'Content is required.',
                })
    start_time = serializers.CharField(required=True, error_messages={
                    'required': 'Start Time is required.',
                    'max_length': 'Start Time must be less than equal to 12 in length.',
                })
    end_time = serializers.CharField(required=True, error_messages={
                    'required': 'End Time is required.',
                    'max_length': 'End Time must be less than equal to 12 in length.',
                })
    sheet_link = serializers.URLField(required=True,error_messages={
                    'required': 'Sheet Link is required.',
                })
    project_link = serializers.URLField(required=True,error_messages={
                    'required': 'Project Link is required.',
                })
    
    sequences = SequenceSerializer(many=True, read_only=True)
    min_difference = serializers.SerializerMethodField()
    sliderData = serializers.SerializerMethodField()
    class Meta:
        model = EpisodeModel
        fields = ['id', 'title', 'sliderData', 'sequences', 'min_difference', 'content', 'start_time', 'end_time', 'sheet_link', 'project_link']

    
    def get_sliderData(self, ep: EpisodeModel):
        sequences_ordered = []
        slider_data = []
        
        sequences = SequenceModel.objects.filter(episode=ep).iterator(1000)
        for seq in sequences:
            # slider_data.append({
            #     "value": seq.sequence_number,
            #     "label": UTIL.convert_seconds_to_time_string(UTIL.convert_time_string_to_seconds(seq.start_time))
            # })
            sequences_ordered.append(seq.start_time)
            sequences_ordered.append(seq.end_time)
        
        sequences_ordered = sorted(set(sequences_ordered))
        # return sequences_ordered
        min_diff = 1
        prev_seq = 0
        for seq in sequences_ordered:
            seconds = UTIL.convert_time_string_to_seconds(seq)
            min_diff = seconds - prev_seq if (seconds - prev_seq) < min_diff and (seconds - prev_seq) > 0 else min_diff
            prev_seq = seconds
            slider_data.append({
                "value": seconds,
                "label": UTIL.convert_seconds_to_time_string(seconds)
            })
        
        self.context["min_difference"] = min_diff
        print(min_diff)
        return slider_data
    
    def get_min_difference(self, ep: EpisodeModel):
        return self.context["min_difference"]
    

# CHAPTER SERIALIZERS
class ChapterUpdateSerializer(serializers.Serializer):
    
    start_sequence_number = serializers.IntegerField(required=True, min_value = 1, error_messages={
                    'invalid': 'Start Sequence Number is required.',
                    'min_value': 'Start Sequence Number must be greater than or equal to 1.',
                })
    end_sequence_number = serializers.IntegerField(required=True, min_value = 1, error_messages={
                    'invalid': 'End Sequence Number is required.',
                    'min_value': 'End Sequence Number must be less than or equal to 1.'
                })
    
    class Meta:
        fields = ["start_sequence_number", "end_sequence_number"]
    
    def update_chapter_reels(self, reel_model:ReelModel):
        reel_sequences = reel_model.sequences.get_queryset()
        
        if reel_sequences.count() > 0:
            contentJoined = ' '.join([seq.words for seq in reel_sequences.only("words")])
            first_seq = reel_sequences.first()
            last_seq = reel_sequences.last()
            
            reel_model.start_time = first_seq.start_time
            reel_model.end_time = last_seq.end_time
            reel_model.content = contentJoined
            reel_model.save()
        else:
            reel_model.delete()
            
    def update_chapters(self, chapter_model:ChapterModel):
        sequences = chapter_model.sequences.get_queryset()
        
        if sequences.count() > 0:
            contentJoined = ' '.join([seq.words for seq in sequences.only("words")])
            first_seq = sequences.first()
            last_seq = sequences.last()
            
            # first updating its reels before updating chapter            
            reels = ReelModel.objects.filter(chapter= chapter_model)
            for reel in reels:
                remaining_sequences = reel.sequences.get_queryset() & sequences
                
                reel.sequences.set(objs=remaining_sequences)
                # update whether needs to be deleted or meta needed to be changed
                self.update_chapter_reels(reel)

            chapter_model.start_time = first_seq.start_time
            chapter_model.end_time = last_seq.end_time
            chapter_model.content = contentJoined
            chapter_model.save()
        else:
            chapter_model.delete()
            
        
        print(chapter_model.title)
        print("Content: ", chapter_model.content) 
        print("Start Sequences: ", first_seq.sequence_number, " End Sequence: ", last_seq.sequence_number)
        
    def validate(self, attrs):
        episode_model = self.context.get("episode")
        chapter_model = self.context.get("chapter")
        start = attrs.get("start_sequence_number")
        end = attrs.get("end_sequence_number")
        
        if start > end:
            raise ValidationError("Start Value should be less than or equal to End Value")
        
        print("Range: ", start, end)
        # getting new sequences and attaching to chapters
        new_sequence_models = SequenceModel.objects.filter(episode=episode_model, sequence_number__gte = start, sequence_number__lte = end )

        # other chapter that have these sequences removing them right away
        other_chapters = ChapterModel.objects.filter(episode=episode_model).exclude(id = chapter_model.id)
        for och in other_chapters:
            o_start = och.sequences.filter().first().sequence_number if och.sequences.filter().count() > 0 else 0
            o_end = och.sequences.filter().last().sequence_number if och.sequences.filter().count() > 0 else 0
            print(o_start, o_end)
            if start > o_start and end < o_end:
                raise ValidationError(f'{chapter_model.title} cannot be a subset of {och.title}')
            
        
 
        print("UPDATING CHAPTERS IN THE DATABASE")
        try:
            # starting a transaction session so if there any error occurs all changes to the database will be rolled back
            with transaction.atomic():
                chapter_model.sequences.set(new_sequence_models, clear=True)
                self.update_chapters(chapter_model)
                
                for och in other_chapters:
                    och.sequences.remove(*new_sequence_models)
                    self.update_chapters(och)
                
                # Commit the transaction before running DatabaseToGoogleSheetUpdater
                DatabaseToGoogleSheetUpdater(episode_model)
        except DatabaseError as ex:
            raise ValidationError("Unable to update sheet data. Some Error Occured.")
        
        return super().validate(attrs)
    

class ChapterListSerializer(serializers.ModelSerializer):
    
    # content = serializers.SerializerMethodField()
    
    num_start_time = serializers.SerializerMethodField()
    num_end_time = serializers.SerializerMethodField()
    
    start_sequence_number = serializers.SerializerMethodField()
    end_sequence_number = serializers.SerializerMethodField()
    class Meta:
        model = ChapterModel
        fields = ['id', 'episode_id', 'title', 'content', 'start_sequence_number', 'end_sequence_number', 'num_start_time', 'num_end_time', 'start_time', 'end_time', "chapter_number"]
    
    # def get_content(self, ch: ChapterModel):
    #     return ch.content[:200]
    
    def get_num_start_time(self, ch: ChapterModel):
        return UTIL.convert_time_string_to_seconds(ch.start_time)
    
    def get_num_end_time(self, ch: ChapterModel):
        return UTIL.convert_time_string_to_seconds(ch.end_time)
    
    def get_start_sequence_number(self, ch: ChapterModel):
        return ch.sequences.first().sequence_number if ch.sequences.count() > 0 else 0
    
    def get_end_sequence_number(self, ch: ChapterModel):
        return ch.sequences.last().sequence_number if ch.sequences.count() > 0 else 0
    
        
class ChapterDetailSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True, max_length = 255, error_messages={
                    'required': 'Title is required.',
                    'max_length': 'Title must be less than 255 characters in length.',
                })
    content = serializers.CharField(required=True, error_messages={
                    'required': 'Content is required.',
                })
    start_time = serializers.CharField(required=True, error_messages={
                    'required': 'Start Time is required.',
                    'max_length': 'Start Time must be less than equal to 12 in length.',
                })
    end_time = serializers.CharField(required=True, error_messages={
                    'required': 'End Time is required.',
                    'max_length': 'End Time must be less than equal to 12 in length.',
                })
    
    
    chapter_number = serializers.IntegerField(required=True, error_messages={
                    'required': 'Chapter Number is required.',
                })
    
    
    min_difference = serializers.SerializerMethodField()
    sliderData = serializers.SerializerMethodField()
    
    id = serializers.UUIDField(read_only=True)
    sequences = SequenceSerializer(many=True, read_only=True)
    episode_id = serializers.PrimaryKeyRelatedField(queryset=EpisodeModel.objects.all())
    
    
    num_start_time = serializers.SerializerMethodField()
    num_end_time = serializers.SerializerMethodField()
    
    start_sequence_number = serializers.SerializerMethodField()
    end_sequence_number = serializers.SerializerMethodField()
    class Meta:
        model = ChapterModel
        # fields = ['id', 'episode_id', 'title', 'content', 'start_time', 'end_time', 'start_sequence_number', "end_sequence_number", "chapter_number"]
        
        fields = ['id', 'episode_id', 'title', 'content', 'start_sequence_number', 'end_sequence_number', 'num_start_time', 'num_end_time', 'start_time', 'end_time', 'sliderData', 'min_difference', "sequences", "chapter_number"]
    
    
    def get_sliderData(self, ch: ChapterModel):
        sequences_ordered = []
        slider_data = []
        
        sequences = ch.sequences.iterator(1000)
        for seq in sequences:
            # slider_data.append({
            #     "value": seq.sequence_number,
            #     "label": UTIL.convert_seconds_to_time_string(UTIL.convert_time_string_to_seconds(seq.start_time))
            # })
            sequences_ordered.append(seq.start_time)
            sequences_ordered.append(seq.end_time)
        
        sequences_ordered = sorted(set(sequences_ordered))
        # return sequences_ordered
        min_diff = 1
        prev_seq = 0
        for seq in sequences_ordered:
            seconds = UTIL.convert_time_string_to_seconds(seq)
            min_diff = seconds - prev_seq if (seconds - prev_seq) < min_diff and (seconds - prev_seq) > 0 else min_diff
            prev_seq = seconds
            slider_data.append({
                "value": seconds,
                "label": UTIL.convert_seconds_to_time_string(seconds)
            })
        
        self.context["min_difference"] = min_diff
        print(min_diff)
        return slider_data
    
    def get_min_difference(self, ch: ChapterModel):
        return self.context["min_difference"]
    
    def get_num_start_time(self, ch: ChapterModel):
        return UTIL.convert_time_string_to_seconds(ch.start_time)
    
    def get_num_end_time(self, ch: ChapterModel):
        return UTIL.convert_time_string_to_seconds(ch.end_time)
    
    def get_start_sequence_number(self, ch: ChapterModel):
        return ch.sequences.first().sequence_number if ch.sequences.count() > 0 else 0
    
    def get_end_sequence_number(self, ch: ChapterModel):
        return ch.sequences.last().sequence_number if ch.sequences.count() > 0 else 0
        
# REELS SERIALIZERS
class ReelDeleteSerializer(serializers.Serializer):
    
    class Meta:
        pass
    
    def validate(self, attrs):
        episode_model = self.context.get("episode") 
        chapter_model = self.context.get("chapter")
        reel_model = self.context.get("reel")
        
 
        print("Deleting REEL IN THE DATABASE")
        try:
            # starting a transaction session so if there any error occurs all changes to the database will be rolled back
            with transaction.atomic():
                reel_model.delete()
                # Commit the transaction before running DatabaseToGoogleSheetUpdater
                DatabaseToGoogleSheetUpdater(episode_model)
        except DatabaseError as ex:
            print(ex)
            raise ValidationError("Unable to delete reel. Some Error Occured.")
        
        return super().validate(attrs)
 
 
class ReelUpdateSerializer(serializers.Serializer):
    start_sequence_number = serializers.IntegerField(required=True, min_value = 1, error_messages={
                    'invalid': 'Start Sequence Number is required.',
                    'min_value': 'Start Sequence Number must be greater than or equal to 1.',
                })
    end_sequence_number = serializers.IntegerField(required=True, min_value = 1, error_messages={
                    'invalid': 'End Sequence Number is required.',
                    'min_value': 'End Sequence Number must be less than or equal to 1.'
                })
    
    class Meta:
        fields = ["start_sequence_number", "end_sequence_number"]
    
    def update_chapter_reels(self, reel_model:ReelModel):
        reel_sequences = reel_model.sequences.get_queryset()
        
        if reel_sequences.count() > 0:
            contentJoined = ' '.join([seq.words for seq in reel_sequences.only("words")])
            first_seq = reel_sequences.first()
            last_seq = reel_sequences.last()
            
            reel_model.start_time = first_seq.start_time
            reel_model.end_time = last_seq.end_time
            reel_model.content = contentJoined
            reel_model.save()
        else:
            reel_model.delete()
       
    def validate(self, attrs):
        episode_model = self.context.get("episode") 
        chapter_model = self.context.get("chapter")
        reel_model = self.context.get("reel")
        
        start = attrs.get("start_sequence_number")
        end = attrs.get("end_sequence_number")
        
        
        if start > end:
            raise ValidationError("Start Value should be less than or equal to End Value")
        
        print("Range: ", start, end)
        
        # if this reel is becoming a subset or superset of any other existing reel raise the Error
        other_chapter_reels = ReelModel.objects.filter(episode=episode_model, chapter = chapter_model).exclude(id=reel_model.id)
        for orl in other_chapter_reels:
            o_start = orl.sequences.filter().first().sequence_number if orl.sequences.filter().count() > 0 else 0
            o_end = orl.sequences.filter().last().sequence_number if orl.sequences.filter().count() > 0 else 0
            print(o_start, o_end)
            
            reel_range  = range(o_start, o_end+1)
            # detecting if lies between an existing reel or intersecting a one
            if start <= o_start and end >= o_end:
                raise ValidationError(f'This Reel cannot not be a superset of an existing ({orl.title}) reel.')
            if start >= o_start and end <= o_end:
                raise ValidationError(f'This Reel cannot be a subset of existing ({orl.title}) reel.')
            if start in reel_range or end in reel_range:
                raise ValidationError(f'This Reel cannot not intersect an existing ({orl.title}) reel.')
            
        # getting new sequences and attaching to reel
        new_sequence_models = chapter_model.sequences.filter(sequence_number__gte = start, sequence_number__lte = end )
           
        
        # raise ValidationError(f'This Reel cannot be a subset of existing reel.')
 
        print("UPDATING REEL IN THE DATABASE")
        try:
            # starting a transaction session so if there any error occurs all changes to the database will be rolled back
            with transaction.atomic():
                reel_model.sequences.set(new_sequence_models, clear=True)
                self.update_chapter_reels(reel_model)
                
                for orl in other_chapter_reels:
                    orl.sequences.remove(*new_sequence_models)
                    self.update_chapter_reels(orl)
                
                # Commit the transaction before running DatabaseToGoogleSheetUpdater
                DatabaseToGoogleSheetUpdater(episode_model)
        except DatabaseError as ex:
            print(ex)
            raise ValidationError("Unable to update reel. Some Error Occured.")
        
        return super().validate(attrs)
  
class ReelAddSerializer(serializers.Serializer):
    start_sequence_number = serializers.IntegerField(required=True, min_value = 1, error_messages={
                    'invalid': 'Start Sequence Number is required.',
                    'min_value': 'Start Sequence Number must be greater than or equal to 1.',
                })
    end_sequence_number = serializers.IntegerField(required=True, min_value = 1, error_messages={
                    'invalid': 'End Sequence Number is required.',
                    'min_value': 'End Sequence Number must be less than or equal to 1.'
                })
    
    class Meta:
        fields = ["start_sequence_number", "end_sequence_number"]
    
    def validate(self, attrs):
        episode_model = self.context.get("episode") 
        chapter_model = self.context.get("chapter")
        
        start = attrs.get("start_sequence_number")
        end = attrs.get("end_sequence_number")
        
        
        if start > end:
            raise ValidationError("Start Value should be less than or equal to End Value")
        
        print("Range: ", start, end)
        
        # if this reel is becoming a subset or superset of any other existing reel raise the Error
        other_chapter_reels = ReelModel.objects.filter(episode=episode_model, chapter = chapter_model)
        last_reel_number = 0
        for orl in other_chapter_reels:
            o_start = orl.sequences.filter().first().sequence_number if orl.sequences.filter().count() > 0 else 0
            o_end = orl.sequences.filter().last().sequence_number if orl.sequences.filter().count() > 0 else 0
            print(o_start, o_end)
            
            last_reel_number = orl.reel_number
            reel_range  = range(o_start, o_end+1)
            # detecting if lies between an existing reel or intersecting a one
            if start <= o_start and end >= o_end:
                raise ValidationError(f'This Reel cannot not be a superset of an existing ({orl.title}) reel.')
            if start >= o_start and end <= o_end:
                raise ValidationError(f'This Reel cannot be a subset of existing ({orl.title}) reel.')
            if start in reel_range or end in reel_range:
                raise ValidationError(f'This Reel cannot not intersect an existing ({orl.title}) reel.')
            
        # creating incremented reel number
        next_reel_number = last_reel_number + 1
        
        # getting new sequences and attaching to reel
        new_sequence_models = chapter_model.sequences.filter(sequence_number__gte = start, sequence_number__lte = end )

        # raise ValidationError(f'This Reel cannot be a subset of existing reel.')
 
        print("ADDING REEL IN THE DATABASE")
        try:
            # starting a transaction session so if there any error occurs all changes to the database will be rolled back
            with transaction.atomic():
                reel_model = ReelModel(
                    id=uuid.uuid4(),
                    episode=episode_model, 
                    chapter=chapter_model,
                    title=f"Reel {next_reel_number}",
                    reel_number=next_reel_number,
                    content=' '.join([seq.words for seq in new_sequence_models.only("words")]),
                    start_time=new_sequence_models.first().start_time,
                    end_time=new_sequence_models.last().end_time,
                )
                
                reel_model.save()
                reel_model.sequences.set(new_sequence_models)
                
                
                # Commit the transaction before running DatabaseToGoogleSheetUpdater
                DatabaseToGoogleSheetUpdater(episode_model)
        except DatabaseError as ex:
            print(ex)
            raise ValidationError("Unable to add reel. Some Error Occured.")
        
        return super().validate(attrs)
        
        
class ReelListSerializer(serializers.ModelSerializer):
    
    # content = serializers.SerializerMethodField()
    
    num_start_time = serializers.SerializerMethodField()
    num_end_time = serializers.SerializerMethodField()
    
    start_sequence_number = serializers.SerializerMethodField()
    end_sequence_number = serializers.SerializerMethodField()
    class Meta:
        model = ReelModel
        fields = ['id', 'episode_id', 'chapter_id', 'title', 'content', 'start_sequence_number', 'end_sequence_number', 'num_start_time', 'num_end_time', 'start_time', 'end_time', "reel_number"]
    
    # def get_content(self, ch: ChapterModel):
    #     return ch.content[:200]
    
    def get_num_start_time(self, ch: ChapterModel):
        return UTIL.convert_time_string_to_seconds(ch.start_time)
    
    def get_num_end_time(self, ch: ChapterModel):
        return UTIL.convert_time_string_to_seconds(ch.end_time)
    
    def get_start_sequence_number(self, ch: ChapterModel):
        return ch.sequences.first().sequence_number if ch.sequences.count() > 0 else 0
    
    def get_end_sequence_number(self, ch: ChapterModel):
        return ch.sequences.last().sequence_number if ch.sequences.count() > 0 else 0
        
class ReelDetailSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    sequences = SequenceSerializer(many=True, read_only=True)
    
    episode_id = serializers.PrimaryKeyRelatedField(queryset=EpisodeModel.objects.all())
    chapter_id = serializers.PrimaryKeyRelatedField(queryset=ChapterModel.objects.all())

    title = serializers.CharField(required=True, max_length = 255, error_messages={
                    'required': 'Title is required.',
                    'max_length': 'Title must be less than 255 characters in length.',
                })
    content = serializers.CharField(required=True, error_messages={
                    'required': 'Content is required.',
                })
    start_time = serializers.CharField(required=True, error_messages={
                    'required': 'Start Time is required.',
                    'max_length': 'Start Time must be less than equal to 12 in length.',
                })
    end_time = serializers.CharField(required=True, error_messages={
                    'required': 'End Time is required.',
                    'max_length': 'End Time must be less than equal to 12 in length.',
                })
    reel_number = serializers.IntegerField(required=True, error_messages={
                    'required': 'Reel Number is required.',
                })
    
    
    class Meta:
        model = ReelModel
        fields = ['id', 'episode_id', 'chapter_id', 'title', 'reel_number', 'sequences', 'content', 'start_time', 'end_time']

    


# AUTH SERIALIZERS
class UserPasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Password is required.',
                    'min_length': 'Password must be greater than 8 in length.'
                })
    password2 = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Confirm password is required.'
                })
    
    class Meta:
        model = UserModel
        fields = ['password', 'password2']
    
    def validate(self, data):
        try:
            uid = self.context.get("uid")
            token = self.context.get("token")
            
            if data['password'] != data['password2']:
                raise serializers.ValidationError("Passwords do not match.")
            
            
            user_id = smart_str(urlsafe_base64_decode(uid))
            user = UserModel.objects.get(id = user_id)
            
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise serializers.ValidationError("Invalid or Outdated Password Reset Link.")
            
            user.set_password(data['password'])
            user.save()
        except DjangoUnicodeDecodeError as ex:
            
            raise serializers.ValidationError("Invalid or Outdated Password Reset Link.")
        return data

class UserPasswordForgotSerializer(serializers.Serializer):
    
    email = serializers.EmailField(required=True, error_messages={
                    'required': 'Email is required.',
                    'invalid': 'Enter a valid email address.'
                })
    
    class Meta:
        model = UserModel
        fields = ['email']
    
    def validate(self, data):
        email = data.get("email")
        user = UserModel.objects.filter(email=email)
        if user.exists():
            if user.filter(is_third_party = False).exists():
                fetched = user.first()
                print(email)
                uid = urlsafe_base64_encode(force_bytes(fetched.id))
                print("Encoded UID: ", uid)
                token = PasswordResetTokenGenerator().make_token(fetched)
                print("Token Generated: ", token)
                link = f'{9}/api/auth/reset/{uid}/{token}'
                print("Password Reset Link: ", link)
                
                email_data = {
                    "subject": "Podcast: Reset Your Password",
                    "body": f"One Time password reset link. Valid for 15 minutes.\nClick on this link below to reset your password.\n{link}",
                    "to_email": fetched.email
                }
                UTIL.send_email(email_data)
            else:
                raise serializers.ValidationError("Social Account cannot forgot the password.")
        else:
            raise serializers.ValidationError("Account associated with this email does not exists.")
            
        # user.set_password(data['password'])
        # user.save()
        return data


class UserChangePasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Password is required.',
                    'min_length': 'Password must be greater than 8 in length.'
                })
    password2 = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Confirm password is required.'
                })
    
    class Meta:
        model = UserModel
        fields = ['password', 'password2']
    
    def validate(self, data):
        # user = self.context.get("user")
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        # user.set_password(data['password'])
        # user.save()
        return data

    
    def update(self, instance, validated_data):
        validated_data.pop('password2')
        return super().update(instance, validated_data)
    
    # def create(self, validated_data):
    #     validated_data.pop('password2')
    #     user = UserModel.objects.create_user(**validated_data)
    #     return user

class UserProfileSerializer(serializers.ModelSerializer):
    
    email = serializers.EmailField(read_only=True, error_messages={
                    'required': 'Email is required.',
                    'invalid': 'Enter a valid email address.'
                })
    profile_image = serializers.ImageField(required=False)
    full_name = serializers.CharField(max_length=255, required=True, error_messages={
                    'required': 'Full name is required.',
                    'max_length': 'Full name cannot be longer than 255 characters.'
                })
    
    class Meta:
        model = UserModel
        fields = ['email', 'full_name', 'profile_image']
        read_only_fields = ['email']
        
    
    def validate_profile_image(self, image):
        # image = self.cleaned_data.get('profile_image', False)
        print(image.__dict__)
        if hasattr(image, "_file"):
            return image
        if image:
            # print(image)
            if image.size > 1*1024*1024:
                raise ValidationError("Image file too large ( > 1mb )")
            # setting unique image name
            id = str(uuid.uuid4())
            extension = image._name.split(".")[len(image._name.split("."))-1]
            image._name = id+"."+extension
            image.field_name = id
            # print(image.__dict__)
            
        return image
        

class UserLoginSerializer(serializers.ModelSerializer):
    
    email = serializers.EmailField(required=True, error_messages={
                    'required': 'Email is required.',
                    'unique': 'An account with this email already exists.',
                    'invalid': 'Enter a valid email address.'
                })
    password = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Password is required.',
                    'min_length': 'Password must be greater than 8 in length.'
                })
    
    class Meta:
        model = UserModel
        fields = ['email', 'password',]


class UserDetailSerializer(serializers.ModelSerializer):
    
    email = serializers.EmailField(required=True, error_messages={
                    'required': 'Email is required.',
                    'unique': 'An account with this email already exists.',
                    'invalid': 'Enter a valid email address.'
                })
    full_name = serializers.CharField(max_length=255, error_messages={
                    'required': 'Full name is required.',
                    'max_length': 'Full name cannot be longer than 255 characters.'
                })
    password = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Password is required.',
                    'min_length': 'Password must be greater than 8 in length.'
                })
    password2 = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Confirm password is required.'
                })
    
    class Meta:
        model = UserModel
        fields = ['email', 'full_name', 'password', 'password2', 'profile_image', 'is_third_party']
        
    
    
    def validate_email(self, email):
        if UserModel.objects.filter(email=email).exists():
            raise ValidationError([
                'An account with this email already exists.'
            ])
        return email
        
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def update(self, instance, validated_data):
        validated_data.pop('password2')
        return super().update(instance, validated_data)
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = UserModel.objects.create_user(**validated_data)
        return user
    
    # def validate(self, 