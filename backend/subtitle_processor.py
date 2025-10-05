from moviepy import VideoFileClip, TextClip, CompositeVideoClip
from arabic_reshaper import reshape
from bidi.algorithm import get_display
from pathlib import Path
import re

class SubtitleProcessor:
    def __init__(self, upload_dir: str = "../uploads", processed_dir: str = "../processed"):
        self.upload_dir = Path(upload_dir)
        self.processed_dir = Path(processed_dir)
    
    def fix_arabic_text(self, text: str) -> str:
        """إصلاح النص العربي ليعرض بشكل صحيح"""
        try:
            reshaped_text = reshape(text)
            bidi_text = get_display(reshaped_text)
            return bidi_text
        except:
            return text
    
    def parse_srt(self, srt_content: str) -> list:
        """تحليل ملف SRT وإرجاع قائمة الترجمات"""
        subtitles = []
        pattern = r'(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n((?:.*\n?)*?)(?=\n\d+\n|\Z)'
        
        matches = re.finditer(pattern, srt_content, re.MULTILINE)
        
        for match in matches:
            index = int(match.group(1))
            start_time = self.srt_time_to_seconds(match.group(2))
            end_time = self.srt_time_to_seconds(match.group(3))
            text = match.group(4).strip()
            
            subtitles.append({
                "index": index,
                "start": start_time,
                "end": end_time,
                "text": text,
                "duration": end_time - start_time
            })
        
        return subtitles
    
    def srt_time_to_seconds(self, time_str: str) -> float:
        """تحويل وقت SRT (00:00:00,000) إلى ثواني"""
        hours, minutes, seconds = time_str.split(':')
        seconds, milliseconds = seconds.split(',')
        
        total_seconds = (
            int(hours) * 3600 +
            int(minutes) * 60 +
            int(seconds) +
            int(milliseconds) / 1000
        )
        
        return total_seconds
    
    def add_subtitles_to_video(
        self, 
        input_filename: str, 
        subtitles: list, 
        output_filename: str,
        font: str = "Arial",
        fontsize: int = 24,
        color: str = "white",
        position: tuple = ('center', 'bottom'),
        bg_color: str = None
    ):
        """إضافة الترجمات إلى الفيديو"""
        try:
            input_path = self.upload_dir / input_filename
            output_path = self.processed_dir / output_filename
            
            video = VideoFileClip(str(input_path))
            
            subtitle_clips = []
            
            for subtitle in subtitles:
                text = subtitle['text']
                
                if self.is_arabic(text):
                    text = self.fix_arabic_text(text)
                
                txt_clip = TextClip(
                    text,
                    fontsize=fontsize,
                    color=color,
                    font=font,
                    method='caption',
                    size=(video.w - 100, None)
                )
                
                if bg_color:
                    txt_clip = txt_clip.on_color(
                        size=(txt_clip.w + 20, txt_clip.h + 10),
                        color=bg_color,
                        col_opacity=0.6
                    )
                
                txt_clip = txt_clip.set_start(subtitle['start'])
                txt_clip = txt_clip.set_duration(subtitle['duration'])
                txt_clip = txt_clip.set_position(position)
                
                subtitle_clips.append(txt_clip)
            
            final_video = CompositeVideoClip([video] + subtitle_clips)
            
            final_video.write_videofile(
                str(output_path),
                codec='libx264',
                audio_codec='aac',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            video.close()
            final_video.close()
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path),
                "subtitles_count": len(subtitles)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def is_arabic(self, text: str) -> bool:
        """التحقق إذا كان النص يحتوي على أحرف عربية"""
        arabic_pattern = re.compile(r'[\u0600-\u06FF]')
        return bool(arabic_pattern.search(text))
    
    def load_srt_file(self, filename: str) -> list:
        """تحميل ملف SRT"""
        try:
            file_path = self.upload_dir / filename
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            subtitles = self.parse_srt(content)
            return {
                "success": True,
                "subtitles": subtitles,
                "count": len(subtitles)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
