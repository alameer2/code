from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_audioclips, CompositeAudioClip
from pathlib import Path
import os

class AudioProcessor:
    def __init__(self, upload_dir: str = "../uploads", processed_dir: str = "../processed"):
        self.upload_dir = Path(upload_dir)
        self.processed_dir = Path(processed_dir)
    
    def extract_audio(self, video_filename: str, output_filename: str):
        """استخراج الصوت من الفيديو"""
        try:
            input_path = self.upload_dir / video_filename
            output_path = self.processed_dir / output_filename
            
            if not input_path.exists():
                return {"success": False, "error": "الملف غير موجود"}
            
            with VideoFileClip(str(input_path)) as video:
                if video.audio is None:
                    return {"success": False, "error": "الفيديو لا يحتوي على صوت"}
                
                video.audio.write_audiofile(str(output_path))
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path),
                "size": os.path.getsize(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def add_background_music(
        self,
        video_filename: str,
        audio_filename: str,
        output_filename: str,
        music_volume: float = 0.3,
        original_volume: float = 1.0
    ):
        """إضافة موسيقى خلفية للفيديو"""
        try:
            video_path = self.upload_dir / video_filename
            audio_path = self.upload_dir / audio_filename
            output_path = self.processed_dir / output_filename
            
            if not video_path.exists():
                video_path = self.processed_dir / video_filename
                if not video_path.exists():
                    return {"success": False, "error": "ملف الفيديو غير موجود"}
            
            if not audio_path.exists():
                audio_path = self.processed_dir / audio_filename
                if not audio_path.exists():
                    return {"success": False, "error": "ملف الصوت غير موجود"}
            
            with VideoFileClip(str(video_path)) as video:
                with AudioFileClip(str(audio_path)) as background_music:
                    # تكرار الموسيقى إذا كانت أقصر من الفيديو
                    if background_music.duration < video.duration:
                        n_loops = int(video.duration / background_music.duration) + 1
                        background_music = concatenate_audioclips([background_music] * n_loops)
                    
                    # قص الموسيقى لتناسب طول الفيديو
                    background_music = background_music.subclipped(0, video.duration)
                    
                    # ضبط مستوى الصوت
                    background_music = background_music.with_volume_scaled(music_volume)
                    
                    # دمج الصوت
                    if video.audio is not None:
                        original_audio = video.audio.with_volume_scaled(original_volume)
                        final_audio = CompositeAudioClip([original_audio, background_music])
                    else:
                        final_audio = background_music
                    
                    final_video = video.with_audio(final_audio)
                    final_video.write_videofile(
                        str(output_path),
                        codec='libx264',
                        audio_codec='aac',
                        temp_audiofile='temp-audio.m4a',
                        remove_temp=True
                    )
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path),
                "size": os.path.getsize(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def adjust_volume(
        self,
        video_filename: str,
        output_filename: str,
        volume: float = 1.0
    ):
        """تعديل مستوى صوت الفيديو"""
        try:
            input_path = self.upload_dir / video_filename
            output_path = self.processed_dir / output_filename
            
            if not input_path.exists():
                input_path = self.processed_dir / video_filename
                if not input_path.exists():
                    return {"success": False, "error": "الملف غير موجود"}
            
            with VideoFileClip(str(input_path)) as video:
                if video.audio is None:
                    return {"success": False, "error": "الفيديو لا يحتوي على صوت"}
                
                adjusted_audio = video.audio.with_volume_scaled(volume)
                final_video = video.with_audio(adjusted_audio)
                
                final_video.write_videofile(
                    str(output_path),
                    codec='libx264',
                    audio_codec='aac',
                    temp_audiofile='temp-audio.m4a',
                    remove_temp=True
                )
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path),
                "size": os.path.getsize(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def replace_audio(
        self,
        video_filename: str,
        audio_filename: str,
        output_filename: str
    ):
        """استبدال صوت الفيديو بصوت آخر"""
        try:
            video_path = self.upload_dir / video_filename
            audio_path = self.upload_dir / audio_filename
            output_path = self.processed_dir / output_filename
            
            if not video_path.exists():
                video_path = self.processed_dir / video_filename
                if not video_path.exists():
                    return {"success": False, "error": "ملف الفيديو غير موجود"}
            
            if not audio_path.exists():
                audio_path = self.processed_dir / audio_filename
                if not audio_path.exists():
                    return {"success": False, "error": "ملف الصوت غير موجود"}
            
            with VideoFileClip(str(video_path)) as video:
                with AudioFileClip(str(audio_path)) as new_audio:
                    # قص/تمديد الصوت ليطابق طول الفيديو
                    if new_audio.duration > video.duration:
                        new_audio = new_audio.subclipped(0, video.duration)
                    elif new_audio.duration < video.duration:
                        # تكرار الصوت
                        n_loops = int(video.duration / new_audio.duration) + 1
                        new_audio = concatenate_audioclips([new_audio] * n_loops)
                        new_audio = new_audio.subclipped(0, video.duration)
                    
                    final_video = video.with_audio(new_audio)
                    final_video.write_videofile(
                        str(output_path),
                        codec='libx264',
                        audio_codec='aac',
                        temp_audiofile='temp-audio.m4a',
                        remove_temp=True
                    )
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path),
                "size": os.path.getsize(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def remove_audio(self, video_filename: str, output_filename: str):
        """إزالة الصوت من الفيديو"""
        try:
            input_path = self.upload_dir / video_filename
            output_path = self.processed_dir / output_filename
            
            if not input_path.exists():
                input_path = self.processed_dir / video_filename
                if not input_path.exists():
                    return {"success": False, "error": "الملف غير موجود"}
            
            with VideoFileClip(str(input_path)) as video:
                video_without_audio = video.without_audio()
                video_without_audio.write_videofile(
                    str(output_path),
                    codec='libx264',
                    temp_audiofile='temp-audio.m4a',
                    remove_temp=True
                )
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path),
                "size": os.path.getsize(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def fade_audio(
        self,
        video_filename: str,
        output_filename: str,
        fade_in_duration: float = 0,
        fade_out_duration: float = 0
    ):
        """إضافة تلاشي للصوت (fade in/out)"""
        try:
            input_path = self.upload_dir / video_filename
            output_path = self.processed_dir / output_filename
            
            if not input_path.exists():
                input_path = self.processed_dir / video_filename
                if not input_path.exists():
                    return {"success": False, "error": "الملف غير موجود"}
            
            with VideoFileClip(str(input_path)) as video:
                if video.audio is None:
                    return {"success": False, "error": "الفيديو لا يحتوي على صوت"}
                
                audio = video.audio
                
                if fade_in_duration > 0:
                    audio = audio.with_effects_on_subclip(0, fade_in_duration, lambda c: c.with_volume_scaled(0))
                
                if fade_out_duration > 0:
                    start_fade = video.duration - fade_out_duration
                    audio = audio.with_effects_on_subclip(start_fade, video.duration, lambda c: c.with_volume_scaled(0))
                
                final_video = video.with_audio(audio)
                final_video.write_videofile(
                    str(output_path),
                    codec='libx264',
                    audio_codec='aac',
                    temp_audiofile='temp-audio.m4a',
                    remove_temp=True
                )
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path),
                "size": os.path.getsize(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
