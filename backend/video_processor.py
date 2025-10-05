from moviepy import VideoFileClip, concatenate_videoclips, CompositeVideoClip
from pathlib import Path
import os

class VideoProcessor:
    def __init__(self, upload_dir: str = "../uploads", processed_dir: str = "../processed"):
        self.upload_dir = Path(upload_dir)
        self.processed_dir = Path(processed_dir)
        self.upload_dir.mkdir(exist_ok=True)
        self.processed_dir.mkdir(exist_ok=True)
    
    def trim_video(self, input_filename: str, start_time: float, end_time: float, output_filename: str):
        """قص الفيديو من start_time إلى end_time"""
        try:
            input_path = self.upload_dir / input_filename
            output_path = self.processed_dir / output_filename
            
            with VideoFileClip(str(input_path)) as video:
                trimmed = video.subclipped(start_time, end_time)
                trimmed.write_videofile(
                    str(output_path),
                    codec='libx264',
                    audio_codec='aac',
                    temp_audiofile='temp-audio.m4a',
                    remove_temp=True
                )
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def concatenate_videos(self, input_filenames: list, output_filename: str):
        """دمج عدة مقاطع فيديو"""
        try:
            clips = []
            for filename in input_filenames:
                input_path = self.upload_dir / filename
                clip = VideoFileClip(str(input_path))
                clips.append(clip)
            
            final_clip = concatenate_videoclips(clips, method="compose")
            output_path = self.processed_dir / output_filename
            
            final_clip.write_videofile(
                str(output_path),
                codec='libx264',
                audio_codec='aac',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            for clip in clips:
                clip.close()
            final_clip.close()
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def change_speed(self, input_filename: str, speed_factor: float, output_filename: str):
        """تغيير سرعة الفيديو"""
        try:
            input_path = self.upload_dir / input_filename
            output_path = self.processed_dir / output_filename
            
            with VideoFileClip(str(input_path)) as video:
                if speed_factor != 1.0:
                    new_video = video.with_speed_scaled(speed_factor)
                else:
                    new_video = video
                
                new_video.write_videofile(
                    str(output_path),
                    codec='libx264',
                    audio_codec='aac',
                    temp_audiofile='temp-audio.m4a',
                    remove_temp=True
                )
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def rotate_video(self, input_filename: str, angle: int, output_filename: str):
        """تدوير الفيديو (90، 180، 270 درجة)"""
        try:
            input_path = self.upload_dir / input_filename
            output_path = self.processed_dir / output_filename
            
            with VideoFileClip(str(input_path)) as video:
                rotated = video.rotated(angle)
                rotated.write_videofile(
                    str(output_path),
                    codec='libx264',
                    audio_codec='aac',
                    temp_audiofile='temp-audio.m4a',
                    remove_temp=True
                )
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def resize_video(self, input_filename: str, width: int, height: int, output_filename: str):
        """تغيير أبعاد الفيديو"""
        try:
            input_path = self.upload_dir / input_filename
            output_path = self.processed_dir / output_filename
            
            with VideoFileClip(str(input_path)) as video:
                resized = video.resized(newsize=(width, height))
                resized.write_videofile(
                    str(output_path),
                    codec='libx264',
                    audio_codec='aac',
                    temp_audiofile='temp-audio.m4a',
                    remove_temp=True
                )
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_video_info(self, filename: str):
        """الحصول على معلومات الفيديو"""
        try:
            input_path = self.upload_dir / filename
            
            with VideoFileClip(str(input_path)) as video:
                return {
                    "success": True,
                    "duration": video.duration,
                    "fps": video.fps,
                    "width": video.w,
                    "height": video.h,
                    "size": os.path.getsize(input_path)
                }
        except Exception as e:
            return {"success": False, "error": str(e)}
