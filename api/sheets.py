from collections import defaultdict
import re
from django.forms import ValidationError

from .models import *

import pandas as pd 
import numpy as np
from io import BytesIO
import requests

class DatabaseGoogleSheetGenerator:
    episode = None
    chapters_sheet_dataframe = pd.DataFrame()
    chapters_filtered_sheet_dataframe = pd.DataFrame()
    
    chapter_sheet_column_names = ["Start Time", "End Time", "Text", "Chapter"]
    
    chapter_filtered_sheet_column_names = ["Start Time", "End Time", "Text", "Chapter"]
    
    def __init__(self, episode_model: EpisodeModel):
        self.episode = episode_model
        
        # initalizing dataframes
        self.chapters_sheet_dataframe[self.chapter_sheet_column_names] = None
        self.chapters_filtered_sheet_dataframe[self.chapter_filtered_sheet_column_names] = None
    
    
    
    def fetch_all_sequences_dataframe(self):
        sequences = SequenceModel.objects.filter(episode=self.episode).iterator(1000)
        
        all_chapters = ChapterModel.objects.filter(episode=self.episode)
        
        # for seq in sequences:
            
        

class GoogleSheetProcessor:
    def __init__(self, sheet, project_url: str, isFile: bool):
        self.project_url = project_url

        if not isFile:
            self.sheet_url = sheet
            self.sheet_key = self.filter_url(sheet)
            self.bytes_data = self.download_google_sheet()
            self.all_sheets = self.load_sheets_from_bytes()
        else:
            self.excel_file = sheet
            self.filename = sheet._name
            self.all_sheets = self.load_sheets_from_file()

        self.episode_title = self.extract_episode_title()

    def filter_url(self, sheet_sharing_url: str) -> str:
        if "https://docs.google.com/spreadsheets/d/" in sheet_sharing_url:
            return sheet_sharing_url.replace("https://docs.google.com/spreadsheets/d/", "").split("/")[0]
        else:
            raise ValidationError("Invalid Google Sheets sharing link")

    def download_google_sheet(self) -> BytesIO:
        self.download_url = f'https://docs.google.com/spreadsheet/ccc?key={self.sheet_key}&output=xlsx'
        response = requests.get(self.download_url)
        self.filename = self.extract_filename(response)
        if response.status_code == 200:
            return BytesIO(response.content)
        else:
            raise ValidationError("Unable to download Google Sheets file.")

    def extract_filename(self, response: requests.Response) -> str:
        content_disposition = response.headers.get('content-disposition')
        if content_disposition:
            filenames = re.findall(r'filename\*?=([^;]+)', content_disposition)
            if filenames:
                filename = filenames[-1].strip()
                if filename.startswith("UTF-8''"):
                    filename = filename[len("UTF-8''"):]
                    filename = requests.utils.unquote(filename)
                return filename.strip('"')
        raise ValidationError("Google Sheets File Provided has no name separated by '[EPISODE TITLE] - [TOOL NAME] - [STATUS]'")

    def load_sheets_from_bytes(self) -> dict:
        excel_file = pd.ExcelFile(self.bytes_data)
        return {sheet_name: pd.read_excel(excel_file, sheet_name=sheet_name, header=0) for sheet_name in excel_file.sheet_names}

    def load_sheets_from_file(self) -> dict:
        excel_file = pd.ExcelFile(self.excel_file)
        return {sheet_name: pd.read_excel(excel_file, sheet_name=sheet_name, header=0) for sheet_name in excel_file.sheet_names}

    def extract_episode_title(self) -> str:
        return self.filename.split("-")[0].strip()

    def save_full_episode_series_sequence(self):
        sequences_sheet = self.all_sheets.get("Copy CSV Here")
        chapters_filtered_sheet = self.all_sheets.get("Chapter Filtered")

        if sequences_sheet is None or chapters_filtered_sheet is None:
            raise ValidationError("Sheets Contain Invalid Episode Data!")

        # sequences_sheet = sequences_sheet.astype(str)
        # chapters_filtered_sheet = chapters_filtered_sheet.astype(str)
        # chapters_filtered_sheet['Chapter'] = chapters_filtered_sheet['Chapter'].fillna(0).astype(int)
        # chapters_filtered_sheet['Reel'] = chapters_filtered_sheet['Reel'].fillna(0).astype(int)

        sequences_sheet['Start Time'] = sequences_sheet['Start Time'].astype(str)
        sequences_sheet['End Time'] = sequences_sheet['End Time'].astype(str)
        sequences_sheet['Text'] = sequences_sheet['Text'].astype(str)

        chapters_filtered_sheet['Start Time'] = chapters_filtered_sheet['Start Time'].astype(str)
        chapters_filtered_sheet['End Time'] = chapters_filtered_sheet['End Time'].astype(str)
        chapters_filtered_sheet['Text'] = chapters_filtered_sheet['Text'].astype(str)
        chapters_filtered_sheet['Chapter'] = chapters_filtered_sheet['Chapter'].fillna(0).astype(int)
        chapters_filtered_sheet['Reel'] = chapters_filtered_sheet['Reel'].fillna(0).astype(int)

        combined_df = pd.merge(
            sequences_sheet,
            chapters_filtered_sheet[['Start Time', 'End Time', 'Text', 'Chapter', 'Reel']],
            on=['Start Time', 'End Time', 'Text'],
            how='outer'
        ).fillna({'Chapter': 0, 'Reel': 0}).astype({'Chapter': int, 'Reel': int})

        episode_model = EpisodeModel.objects.create(
            title=self.episode_title,
            content="",
            start_time=None,
            end_time=None,
            sheet_link=self.sheet_url,
            project_link=self.project_url
        )

        sequence_models = []
        chapters = {}
        reels = {}
        sequence_number = 0
        for row in combined_df.itertuples(index=False):
            sequence_uid = uuid.uuid4()
            sequence_number += 1
            sequence_model = SequenceModel(
                id=sequence_uid,
                episode=episode_model,
                words=row.Text,
                sequence_number=sequence_number,
                start_time=row._1,
                end_time=row._2
            )
            sequence_models.append(sequence_model)

            if row.Chapter:
                chapters.setdefault(row.Chapter, []).append(sequence_model)
            if row.Reel:
                reels.setdefault(row.Reel, []).append(sequence_model)

        SequenceModel.objects.bulk_create(sequence_models)

        chapter_models = []
        for chapter_number, sequence_models in chapters.items():
            chapter_uid = uuid.uuid4()
            chapter_model = ChapterModel(
                id=chapter_uid,
                episode=episode_model,
                title=f"Chapter {chapter_number}",
                chapter_number=chapter_number,
                content=" ".join(combined_df.loc[combined_df['Chapter'] == chapter_number, 'Text']),
                start_time=combined_df.loc[combined_df['Chapter'] == chapter_number, 'Start Time'].min(),
                end_time=combined_df.loc[combined_df['Chapter'] == chapter_number, 'End Time'].max(),
            )
            chapter_model.save()
            chapter_models.append(chapter_model)
            chapter_model.sequences.set(sequence_models)
            # for sequence_id in sequence_ids:
            #     chapter_model.sequences.add(SequenceModel.objects.get(id=sequence_id))

        # ChapterModel.objects.bulk_create(chapter_models)

        reel_models = []
        for reel_number, sequence_models in reels.items():
            reel_uid = uuid.uuid4()
            reel_model = ReelModel(
                id=reel_uid,
                episode=episode_model,
                chapter=next((c for c in chapter_models if c.chapter_number == combined_df.loc[combined_df['Reel'] == reel_number, 'Chapter'].iloc[0]), None),
                title=f"Reel {reel_number}",
                reel_number=reel_number,
                content=" ".join(combined_df.loc[combined_df['Reel'] == reel_number, 'Text']),
                start_time=combined_df.loc[combined_df['Reel'] == reel_number, 'Start Time'].min(),
                end_time=combined_df.loc[combined_df['Reel'] == reel_number, 'End Time'].max(),
            )
            reel_model.save()
            reel_models.append(reel_model)
            reel_model.sequences.set(sequence_models)
            # for sequence_id in sequence_models:
            #     reel_model.sequences.add(SequenceModel.objects.get(id=sequence_id))

        # ReelModel.objects.bulk_create(reel_models)

        episode_model.content = " ".join(combined_df['Text'])
        episode_model.start_time = combined_df['Start Time'].min()
        episode_model.end_time = combined_df['End Time'].max()
        episode_model.save()

    def __str__(self) -> str:
        return str({sheet: df.shape for sheet, df in self.all_sheets.items()})