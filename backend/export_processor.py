from moviepy.editor import VideoFileClip
from pathlib import Path
import os

class ExportProcessor:
    def __init__(self, upload_dir: str = "../uploads", processed_dir: str = "../processed"):
        self.upload_dir = Path(upload_dir)
        self.processed_dir = Path(processed_dir)
        
        self.quality_presets = {
            "720p": {
                "width": 1280,
                "height": 720,
                "bitrate": "2000k"
            },
            "1080p": {
                "width": 1920,
                "height": 1080,
                "bitrate": "4000k"
            },
            "1440p": {
                "width": 2560,
                "height": 1440,
                "bitrate": "8000k"
            },
            "4k": {
                "width": 3840,
                "height": 2160,
                "bitrate": "16000k"
            }
        }
    
    def export_video(
        self,
        input_filename: str,
        output_filename: str,
        quality: str = "1080p",
        format: str = "mp4",
        fps: int = None,
        audio_bitrate: str = "192k"
    ):
        """تصدير الفيديو بجودة وصيغة محددة"""
        try:
            input_path = self.upload_dir / input_filename
            output_path = self.processed_dir / output_filename
            
            if not input_path.exists():
                # Try processed dir
                input_path = self.processed_dir / input_filename
                if not input_path.exists():
                    return {"success": False, "error": "الملف غير موجود"}
            
            preset = self.quality_presets.get(quality)
            
            with VideoFileClip(str(input_path)) as video:
                # تطبيق الجودة
                if preset:
                    # حساب الأبعاد مع الحفاظ على نسبة العرض
                    target_width = preset["width"]
                    target_height = preset["height"]
                    
                    aspect_ratio = video.w / video.h
                    target_aspect = target_width / target_height
                    
                    if aspect_ratio > target_aspect:
                        new_width = target_width
                        new_height = int(target_width / aspect_ratio)
                    else:
                        new_height = target_height
                        new_width = int(target_height * aspect_ratio)
                    
                    # تصغير/تكبير الفيديو
                    if new_width != video.w or new_height != video.h:
                        video_resized = video.resized((new_width, new_height))
                    else:
                        video_resized = video
                else:
                    video_resized = video
                    preset = {"bitrate": "4000k"}
                
                # تحديد الـ FPS
                final_fps = fps if fps else video.fps
                
                # تحديد codec حسب الصيغة
                codec_map = {
                    "mp4": "libx264",
                    "webm": "libvpx-vp9",
                    "avi": "mpeg4",
                    "mov": "libx264"
                }
                codec = codec_map.get(format, "libx264")
                
                # تصدير الفيديو
                video_resized.write_videofile(
                    str(output_path),
                    codec=codec,
                    audio_codec='aac' if format in ['mp4', 'mov'] else 'libvorbis',
                    bitrate=preset["bitrate"],
                    audio_bitrate=audio_bitrate,
                    fps=final_fps,
                    temp_audiofile='temp-audio.m4a',
                    remove_temp=True
                )
            
            file_size = os.path.getsize(output_path)
            
            return {
                "success": True,
                "output_file": output_filename,
                "path": str(output_path),
                "size": file_size,
                "format": format,
                "quality": quality
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def export_with_custom_settings(
        self,
        input_filename: str,
        output_filename: str,
        width: int,
        height: int,
        bitrate: str = "4000k",
        fps: int = 30,
        format: str = "mp4"
    ):
        """تصدير بإعدادات مخصصة"""
        try:
            input_path = self.upload_dir / input_filename
            output_path = self.processed_dir / output_filename
            
            if not input_path.exists():
                input_path = self.processed_dir / input_filename
                if not input_path.exists():
                    return {"success": False, "error": "الملف غير موجود"}
            
            with VideoFileClip(str(input_path)) as video:
                resized = video.resized((width, height))
                
                codec_map = {
                    "mp4": "libx264",
                    "webm": "libvpx-vp9",
                    "avi": "mpeg4",
                    "mov": "libx264"
                }
                codec = codec_map.get(format, "libx264")
                
                resized.write_videofile(
                    str(output_path),
                    codec=codec,
                    audio_codec='aac' if format in ['mp4', 'mov'] else 'libvorbis',
                    bitrate=bitrate,
                    fps=fps,
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
    
    def get_available_qualities(self):
        """الحصول على قائمة الجودات المتاحة"""
        return list(self.quality_presets.keys())
    
    def get_available_formats(self):
        """الحصول على قائمة الصيغ المتاحة"""
        return ["mp4", "webm", "avi", "mov"]
