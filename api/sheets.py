from django.forms import ValidationError
import openpyxl
import openpyxl.utils
import openpyxl.utils.dataframe

from .models import *
from .utils import FileManager

import pandas as pd 
import numpy as np
from io import BytesIO
import requests, re, time

from django.db import transaction

from core.settings import GOOGLE_SHEET_CLIENT as gsclient

class DatabaseToGoogleSheetUpdater:
    
    def __init__(self, episode_model: EpisodeModel):
        self.episode = episode_model
        self.chapter_filtered_sheet_reel_col_data = []
        self.chapter_sheet_dict = {
            "1": [],
            "Start Time": [],
            "End Time": [],
            "Text": [],
            "Chapter": [],
        }
        self.chapters_sheet_dataframe = pd.DataFrame()
        
        self.get_database_to_dataframe()

        if "episodes/" in episode_model.sheet_link:
            self.update_file_sheet(episode_model.sheet_link)
        else:
            self.update_google_sheet(episode_model.sheet_link)

    def get_database_to_dataframe(self):
        with transaction.atomic():
            sequences = SequenceModel.objects.filter(episode=self.episode).iterator(1000)
            all_chapters = ChapterModel.objects.filter(episode=self.episode)
            all_reels = ReelModel.objects.filter(episode=self.episode).select_related('chapter')
            
            
            print("DATABASE TO DATAFRAME")
            # Build a dictionary for chapter and reel sequence ids
            chapter_sequence_dict = {
                f"{ch.chapter_number}":{
                    "sequences": [seq.id for seq in ch.sequences.get_queryset()],
                    "reels": {
                        f"{rl.reel_number}": [seq.id for seq in rl.sequences.get_queryset()]
                    for rl in [ch_reel for ch_reel in all_reels]}
                } 
                for ch in all_chapters}
            
            print(chapter_sequence_dict.__sizeof__())
            
            for sequence in sequences:
                sequence.refresh_from_db()
                # index += 1
                self.chapter_sheet_dict["1"].append("")
                self.chapter_sheet_dict["Start Time"].append(sequence.start_time)
                self.chapter_sheet_dict["End Time"].append(sequence.end_time)
                self.chapter_sheet_dict["Text"].append(sequence.words)

                chapter_number = ""
                reel_number = ""
                for c_num, c_data in chapter_sequence_dict.items():
                    if sequence.id in c_data["sequences"]:
                        chapter_number = c_num
                        for r_num, r_data in c_data["reels"].items():
                            if sequence.id in r_data:
                                reel_number = r_num
                                break
                        break

                self.chapter_sheet_dict["Chapter"].append(chapter_number)

                if chapter_number != "":
                    self.chapter_filtered_sheet_reel_col_data.append(reel_number)
            
            # raise KeyError(23213)
            # Build a dictionary for chapter and reel ranges
            # chapter_number_dict = {}
            # for ch in all_chapters:
            #     ch.refresh_from_db()
            #     c_f = ch.sequences.first().sequence_number
            #     c_l = ch.sequences.last().sequence_number
            #     # print(ch.title)
            #     # print("Content: ", ch.content) 
            #     # print("Start Sequences: ", c_f, " End Sequence: ", c_l)   
            #     chapter_number_dict[f"{ch.chapter_number}"] = {
            #         "range": range(c_f, c_l+1),
            #         "reels": {}
            #     }

            #     for rl in ReelModel.objects.filter(episode=self.episode, chapter=ch):
            #         rl.refresh_from_db()
            #         chapter_number_dict[f"{ch.chapter_number}"]["reels"][f"{rl.reel_number}"] = range(rl.sequences.first().sequence_number, rl.sequences.last().sequence_number + 1)

            # print(chapter_number_dict)
            
            # # index = 0
            # for sequence in sequences:
            #     sequence.refresh_from_db()
            #     # index += 1
            #     self.chapter_sheet_dict["1"].append("")
            #     self.chapter_sheet_dict["Start Time"].append(sequence.start_time)
            #     self.chapter_sheet_dict["End Time"].append(sequence.end_time)
            #     self.chapter_sheet_dict["Text"].append(sequence.words)

            #     chapter_number = ""
            #     reel_number = ""
            #     for c_num, c_data in chapter_number_dict.items():
            #         # if index <= 50:
            #         #     print("Seq Num: ",sequence.sequence_number, " Range: ", c_data["range"])
            #         if sequence.sequence_number in c_data["range"]:
            #             chapter_number = c_num
            #             for r_num, r_data in c_data["reels"].items():
            #                 if sequence.sequence_number in r_data:
            #                     reel_number = r_num
            #                     break
            #             break

            #     self.chapter_sheet_dict["Chapter"].append(chapter_number)

            #     if chapter_number != "":
            #         self.chapter_filtered_sheet_reel_col_data.append(reel_number)
                    

            self.chapters_sheet_dataframe = pd.DataFrame(self.chapter_sheet_dict)
            
        print(self.chapters_sheet_dataframe.head(50))

    def update_google_sheet(self, sheet_link):
        try:
            gexcel = gsclient.open_by_url(sheet_link)
            
            chapters_worksheet = gexcel.worksheet("Chapters")
            chapters_worksheet.clear()
            chapters_worksheet.insert_row(list(self.chapter_sheet_dict.keys()))
            cf_list = self.chapters_sheet_dataframe.values.tolist()
            chapters_worksheet.append_rows(cf_list)

            filtered_chapters_worksheet = gexcel.worksheet("Chapter Filtered")
            # filtered_chapters_worksheet.resize(1)
            # Update "Reel" column in "Chapter Filtered" sheet
            filtered_chapters_worksheet.update("F2:F", [ [reel_number] for reel_number in self.chapter_filtered_sheet_reel_col_data ])
            
            
            copy_csv_here_worksheet = gexcel.worksheet("Copy CSV Here")
            # Update "Text" column in "Copy CSV Here" sheet
            copy_csv_here_worksheet.update("D2:D", [ [words] for words in self.chapter_sheet_dict["Text"] ])
        except Exception as ex:
            raise ValidationError("Unable to download and update google sheet. Check Google API credentials or Network Connection.")            
        
    def update_file_sheet(self, file_path):
        
        try:
            with FileManager.open(file_path, "rb") as file:
                workbook = openpyxl.load_workbook(file)
                
                chapters_sheet = workbook["Chapters"]
                print(chapters_sheet)
                chapters_sheet_df = openpyxl.utils.dataframe.dataframe_to_rows(self.chapters_sheet_dataframe, index=False, header=True)
                # print(chapters_sheet.print_title_rows)
                for r_idx, row in enumerate(chapters_sheet_df, 1):
                    for c_idx, value in enumerate(row, 1):
                        chapters_sheet.cell(row=r_idx, column=c_idx, value=value)
                        
                        
                chapter_filtered_sheet = workbook["Chapter Filtered"]
                # Update "Reel" column in "Chapter Filtered" sheet
                for row, reel_value in enumerate(self.chapter_filtered_sheet_reel_col_data):
                        chapter_filtered_sheet[f"F{row+2}"].value = reel_value


                copy_csv_here_sheet = workbook["Chapter Filtered"]
                # Update "Text" column in "Copy CSV Here" sheet
                for row, words in enumerate(self.chapter_sheet_dict["Text"]):
                        copy_csv_here_sheet[f"D{row+2}"].value = words
                        
                # Save the updated workbook
                with FileManager.open(file_path, "wb") as file:
                    workbook.save(file)
        except Exception as ex:
            print(ex)
            raise ValidationError("Unable to load and update excel file.")     


class GoogleSheetProcessor:
    def __init__(self, sheet, project_url: str, isFile: bool):
        self.project_url = project_url

        start_time = time.time()
        if not isFile:
            self.sheet_url = sheet
            # self.sheet_key = self.filter_url(sheet)
            self.excel_file = self.download_google_sheet()
            self.all_sheets = self.load_sheets_from_google_sheet()
        else:
            self.excel_file = sheet
            self.filename = sheet._name
            self.sheet_url = self.filename
            self.all_sheets = self.load_sheets_from_file()
        end_time = time.time()
        print(f"Initialization time: {end_time - start_time} seconds")

        start_time = time.time()
        self.episode_title = self.extract_episode_title()
        end_time = time.time()
        print(f"Extract episode title time: {end_time - start_time} seconds")

    # def filter_url(self, sheet_sharing_url: str) -> str:
    #     start_time = time.time()
    #     if "https://docs.google.com/spreadsheets/d/" in sheet_sharing_url:
    #         result = sheet_sharing_url.replace("https://docs.google.com/spreadsheets/d/", "").split("/")[0]
    #     else:
    #         raise ValidationError("Invalid Google Sheets sharing link")
    #     end_time = time.time()
    #     print(f"Filter URL time: {end_time - start_time} seconds")
    #     return result

    def download_google_sheet(self) -> gspread.spreadsheet.Spreadsheet:
        start_time = time.time()
        # self.download_url = f'https://docs.google.com/spreadsheet/ccc?key={self.sheet_key}&output=xlsx'
        # response = requests.get(self.download_url)
        # self.filename = self.extract_filename(response)
        try:
            worksheets = gsclient.open_by_url(self.sheet_url)
            self.filename = worksheets.title
        except Exception as ex:
            raise ValidationError("Unable to download Google Sheets file.")
        end_time = time.time()
        print(f"Download Google Sheet time: {end_time - start_time} seconds")
        return worksheets

    # def extract_filename(self, response: requests.Response) -> str:
    #     start_time = time.time()
    #     content_disposition = response.headers.get('content-disposition')
    #     if content_disposition:
    #         filenames = re.findall(r'filename\*?=([^;]+)', content_disposition)
    #         if filenames:
    #             filename = filenames[-1].strip()
    #             if filename.startswith("UTF-8''"):
    #                 filename = filename[len("UTF-8''"):]
    #                 filename = requests.utils.unquote(filename)
    #             result = filename.strip('"')
    #         else:
    #             raise ValidationError("Google Sheets File Provided has no name separated by '[EPISODE TITLE] - [TOOL NAME] - [STATUS]'")
    #     else:
    #         raise ValidationError("Google Sheets File Provided has no name separated by '[EPISODE TITLE] - [TOOL NAME] - [STATUS]'")
    #     end_time = time.time()
    #     print(f"Extract filename time: {end_time - start_time} seconds")
    #     return result

    def load_sheets_from_google_sheet(self) -> dict[str: pd.DataFrame]:
        start_time = time.time()
        result = {}
        sheet = self.excel_file.worksheet("Copy CSV Here").get_all_values()
        columns = sheet.pop(0)
        result["Copy CSV Here"] = pd.DataFrame(sheet, columns=columns)
        sheet = self.excel_file.worksheet("Chapter Filtered").get_all_values()
        columns = sheet.pop(0)
        result["Chapter Filtered"] = pd.DataFrame(sheet, columns=columns)
        end_time = time.time()
        print(f"Load sheets from Spreadsheet time: {end_time - start_time} seconds")
        return result

    def load_sheets_from_file(self) -> dict[str: pd.DataFrame]:
        start_time = time.time()
        excel_file = pd.ExcelFile(self.excel_file)
        result = {sheet_name: pd.read_excel(excel_file, sheet_name=sheet_name, header=0) for sheet_name in excel_file.sheet_names if sheet_name in ["Copy CSV Here", "Chapter Filtered"]}
        end_time = time.time()
        print(f"Load sheets from file time: {end_time - start_time} seconds")
        return result

    def extract_episode_title(self) -> str:
        start_time = time.time()
        result = self.filename.split("-")[0].strip()
        end_time = time.time()
        print(f"Extract episode title time: {end_time - start_time} seconds")
        return result

    def save_full_episode_series_sequence(self):
        start_time = time.time()
        sequences_sheet = self.all_sheets.get("Copy CSV Here")
        chapters_filtered_sheet = self.all_sheets.get("Chapter Filtered")

        if sequences_sheet is None or chapters_filtered_sheet is None:
            raise ValidationError("Sheets Contain Invalid Episode Data!")

        sequences_sheet['Start Time'] = sequences_sheet['Start Time'].astype(str)
        sequences_sheet['End Time'] = sequences_sheet['End Time'].astype(str)
        sequences_sheet['Text'] = sequences_sheet['Text'].astype(str)

        chapters_filtered_sheet['Start Time'] = chapters_filtered_sheet['Start Time'].astype(str)
        chapters_filtered_sheet['End Time'] = chapters_filtered_sheet['End Time'].astype(str)
        chapters_filtered_sheet['Text'] = chapters_filtered_sheet['Text'].astype(str)
        chapters_filtered_sheet['Chapter'] = chapters_filtered_sheet['Chapter'].replace('', np.nan).fillna(0).astype(int)
        chapters_filtered_sheet['Reel'] = chapters_filtered_sheet['Reel'].replace('', np.nan).fillna(0).astype(int)

        combined_df = pd.merge(
            sequences_sheet,
            chapters_filtered_sheet[['Start Time', 'End Time', 'Text', 'Chapter', 'Reel']],
            on=['Start Time', 'End Time', 'Text'],
            how='outer'
        ).fillna({'Chapter': 0, 'Reel': 0}).astype({'Chapter': int, 'Reel': int})

        episode_model = EpisodeModel.objects.create(
            id=uuid.uuid4(),
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
                reels.setdefault(f"{row.Chapter}-{row.Reel}", []).append(sequence_model)

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

        reel_models = []
        for reel_key, sequence_models in reels.items():
            chapter_number, reel_number = reel_key.split("-")
            chapter_number = int(chapter_number)
            reel_number = int(reel_number)
            reel_uid = uuid.uuid4()
            reel_model = ReelModel(
                id=reel_uid,
                episode=episode_model,
                chapter=next((c for c in chapter_models if c.chapter_number == chapter_number), None),
                title=f"Reel {reel_number}",
                reel_number=reel_number,
                content=" ".join(combined_df.loc[(combined_df['Reel'] == reel_number) & (combined_df['Chapter'] == chapter_number), 'Text']),
                start_time=combined_df.loc[(combined_df['Reel'] == reel_number) & (combined_df['Chapter'] == chapter_number), 'Start Time'].min(),
                end_time=combined_df.loc[(combined_df['Reel'] == reel_number) & (combined_df['Chapter'] == chapter_number), 'End Time'].max(),
            )
            reel_model.save()
            reel_models.append(reel_model)
            reel_model.sequences.set(sequence_models)

        episode_model.content = " ".join(combined_df['Text'])
        episode_model.start_time = combined_df['Start Time'].min()
        episode_model.end_time = combined_df['End Time'].max()
        
        # saving excel file to media storagee
        if type(self.excel_file) is not gspread.spreadsheet.Spreadsheet:
            print("SAVING FILE")
            file_path = f"episodes/{episode_model.id}.xlsx"
            episode_model.sheet_link = file_path
            FileManager.save(file_path, self.excel_file)
        
        episode_model.save()

        end_time = time.time()
        print(f"Save full episode series sequence time: {end_time - start_time} seconds")

    
        
        
        
    def __str__(self) -> str:
        return str({sheet: df.shape for sheet, df in self.all_sheets.items()})
