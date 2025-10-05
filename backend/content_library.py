from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, ImageClip
from pathlib import Path
import os
import numpy as np

class ContentLibrary:
    def __init__(self, upload_dir: str = "../uploads", processed_dir: str = "../processed"):
        self.upload_dir = Path(upload_dir)
        self.processed_dir = Path(processed_dir)
        
        self.transitions = {
            "fade": self.apply_fade_transition,
            "crossfade": self.apply_crossfade_transition,
            "slide_left": self.apply_slide_left_transition,
            "slide_right": self.apply_slide_right_transition,
            "zoom": self.apply_zoom_transition
        }
        
        self.filters = {
            "brightness": self.apply_brightness_filter,
            "contrast": self.apply_contrast_filter,
            "grayscale": self.apply_grayscale_filter,
            "sepia": self.apply_sepia_filter,
            "blur": self.apply_blur_filter,
            "invert": self.apply_invert_filter
        }
    
    def apply_transition(
        self,
        clip1_filename: str,
        clip2_filename: str,
        output_filename: str,
        transition_type: str = "fade",
        duration: float = 1.0
    ):
        """تطبيق انتقال بين مقطعين"""
        try:
            clip1_path = self.upload_dir / clip1_filename
            clip2_path = self.upload_dir / clip2_filename
            output_path = self.processed_dir / output_filename
            
            for path in [clip1_path, clip2_path]:
                if not path.exists():
                    alt_path = self.processed_dir / path.name
                    if not alt_path.exists():
                        return {"success": False, "error": f"الملف {path.name} غير موجود"}
            
            transition_func = self.transitions.get(transition_type)
            if not transition_func:
                return {"success": False, "error": "نوع الانتقال غير مدعوم"}
            
            result = transition_func(str(clip1_path), str(clip2_path), str(output_path), duration)
            
            if result:
                return {
                    "success": True,
                    "output_file": output_filename,
                    "path": str(output_path),
                    "size": os.path.getsize(output_path)
                }
            return {"success": False, "error": "فشل تطبيق الانتقال"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def apply_fade_transition(self, clip1_path, clip2_path, output_path, duration):
        """انتقال تلاشي"""
        with VideoFileClip(clip1_path) as clip1, VideoFileClip(clip2_path) as clip2:
            clip1_with_fadeout = clip1.with_effects([lambda c: c.with_opacity(lambda t: 1 - t/duration)])
            clip2_with_fadein = clip2.with_effects([lambda c: c.with_opacity(lambda t: t/duration)])
            clip2_with_fadein = clip2_with_fadein.with_start(clip1.duration - duration)
            
            final = CompositeVideoClip([clip1_with_fadeout, clip2_with_fadein])
            final.write_videofile(output_path, codec='libx264', audio_codec='aac')
        return True
    
    def apply_crossfade_transition(self, clip1_path, clip2_path, output_path, duration):
        """انتقال تلاشي متقاطع"""
        return self.apply_fade_transition(clip1_path, clip2_path, output_path, duration)
    
    def apply_slide_left_transition(self, clip1_path, clip2_path, output_path, duration):
        """انتقال انزلاق لليسار"""
        with VideoFileClip(clip1_path) as clip1, VideoFileClip(clip2_path) as clip2:
            w, h = clip1.w, clip1.h
            
            def slide_left(t):
                return ('center', int(w * t / duration))
            
            clip2 = clip2.with_start(clip1.duration - duration)
            clip2 = clip2.with_position(slide_left)
            
            final = CompositeVideoClip([clip1, clip2], size=(w, h))
            final.write_videofile(output_path, codec='libx264', audio_codec='aac')
        return True
    
    def apply_slide_right_transition(self, clip1_path, clip2_path, output_path, duration):
        """انتقال انزلاق لليمين"""
        with VideoFileClip(clip1_path) as clip1, VideoFileClip(clip2_path) as clip2:
            w, h = clip1.w, clip1.h
            
            def slide_right(t):
                return ('center', int(-w + w * t / duration))
            
            clip2 = clip2.with_start(clip1.duration - duration)
            clip2 = clip2.with_position(slide_right)
            
            final = CompositeVideoClip([clip1, clip2], size=(w, h))
            final.write_videofile(output_path, codec='libx264', audio_codec='aac')
        return True
    
    def apply_zoom_transition(self, clip1_path, clip2_path, output_path, duration):
        """انتقال تكبير"""
        with VideoFileClip(clip1_path) as clip1, VideoFileClip(clip2_path) as clip2:
            def zoom_effect(t):
                return 1 + (t / duration) * 0.5
            
            clip1_zoomed = clip1.resized(lambda t: zoom_effect(t))
            clip2_with_fadein = clip2.with_effects([lambda c: c.with_opacity(lambda t: t/duration)])
            clip2_with_fadein = clip2_with_fadein.with_start(clip1.duration - duration)
            
            final = CompositeVideoClip([clip1_zoomed, clip2_with_fadein])
            final.write_videofile(output_path, codec='libx264', audio_codec='aac')
        return True
    
    def apply_filter(
        self,
        video_filename: str,
        output_filename: str,
        filter_type: str,
        intensity: float = 1.0
    ):
        """تطبيق فلتر على الفيديو"""
        try:
            input_path = self.upload_dir / video_filename
            output_path = self.processed_dir / output_filename
            
            if not input_path.exists():
                input_path = self.processed_dir / video_filename
                if not input_path.exists():
                    return {"success": False, "error": "الملف غير موجود"}
            
            filter_func = self.filters.get(filter_type)
            if not filter_func:
                return {"success": False, "error": "الفلتر غير مدعوم"}
            
            with VideoFileClip(str(input_path)) as video:
                filtered_video = filter_func(video, intensity)
                filtered_video.write_videofile(
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
    
    def apply_brightness_filter(self, video, intensity):
        """فلتر السطوع"""
        def brightness_effect(image):
            return np.clip(image * (1 + (intensity - 1)), 0, 255).astype('uint8')
        return video.image_transform(brightness_effect)
    
    def apply_contrast_filter(self, video, intensity):
        """فلتر التباين"""
        def contrast_effect(image):
            factor = intensity
            mean = np.mean(image)
            return np.clip((image - mean) * factor + mean, 0, 255).astype('uint8')
        return video.image_transform(contrast_effect)
    
    def apply_grayscale_filter(self, video, intensity):
        """فلتر أبيض وأسود"""
        def grayscale_effect(image):
            gray = np.dot(image[...,:3], [0.299, 0.587, 0.114])
            gray_rgb = np.stack([gray, gray, gray], axis=-1)
            return (image * (1 - intensity) + gray_rgb * intensity).astype('uint8')
        return video.image_transform(grayscale_effect)
    
    def apply_sepia_filter(self, video, intensity):
        """فلتر سيبيا"""
        def sepia_effect(image):
            sepia_matrix = np.array([
                [0.393, 0.769, 0.189],
                [0.349, 0.686, 0.168],
                [0.272, 0.534, 0.131]
            ])
            sepia_img = np.dot(image[...,:3], sepia_matrix.T)
            sepia_img = np.clip(sepia_img, 0, 255)
            return (image * (1 - intensity) + sepia_img * intensity).astype('uint8')
        return video.image_transform(sepia_effect)
    
    def apply_blur_filter(self, video, intensity):
        """فلتر ضبابية"""
        from scipy.ndimage import gaussian_filter
        def blur_effect(image):
            blurred = gaussian_filter(image, sigma=intensity * 3)
            return blurred.astype('uint8')
        return video.image_transform(blur_effect)
    
    def apply_invert_filter(self, video, intensity):
        """فلتر عكس الألوان"""
        def invert_effect(image):
            inverted = 255 - image
            return (image * (1 - intensity) + inverted * intensity).astype('uint8')
        return video.image_transform(invert_effect)
    
    def add_text_overlay(
        self,
        video_filename: str,
        output_filename: str,
        text: str,
        position: tuple = ('center', 'bottom'),
        fontsize: int = 50,
        color: str = 'white',
        duration: float = None
    ):
        """إضافة نص على الفيديو"""
        try:
            input_path = self.upload_dir / video_filename
            output_path = self.processed_dir / output_filename
            
            if not input_path.exists():
                input_path = self.processed_dir / video_filename
                if not input_path.exists():
                    return {"success": False, "error": "الملف غير موجود"}
            
            with VideoFileClip(str(input_path)) as video:
                text_duration = duration if duration else video.duration
                
                txt_clip = TextClip(
                    text=text,
                    font_size=fontsize,
                    color=color,
                    duration=text_duration
                ).with_position(position)
                
                final = CompositeVideoClip([video, txt_clip])
                final.write_videofile(
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
    
    def add_sticker(
        self,
        video_filename: str,
        sticker_filename: str,
        output_filename: str,
        position: tuple = ('center', 'center'),
        size: tuple = None,
        duration: float = None
    ):
        """إضافة ملصق/صورة على الفيديو"""
        try:
            video_path = self.upload_dir / video_filename
            sticker_path = self.upload_dir / sticker_filename
            output_path = self.processed_dir / output_filename
            
            if not video_path.exists():
                video_path = self.processed_dir / video_filename
                if not video_path.exists():
                    return {"success": False, "error": "ملف الفيديو غير موجود"}
            
            if not sticker_path.exists():
                sticker_path = self.processed_dir / sticker_filename
                if not sticker_path.exists():
                    return {"success": False, "error": "ملف الملصق غير موجود"}
            
            with VideoFileClip(str(video_path)) as video:
                sticker_duration = duration if duration else video.duration
                
                sticker = ImageClip(str(sticker_path), duration=sticker_duration)
                
                if size:
                    sticker = sticker.resized(size)
                
                sticker = sticker.with_position(position)
                
                final = CompositeVideoClip([video, sticker])
                final.write_videofile(
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
    
    def get_available_transitions(self):
        """الحصول على قائمة الانتقالات المتاحة"""
        return list(self.transitions.keys())
    
    def get_available_filters(self):
        """الحصول على قائمة الفلاتر المتاحة"""
        return list(self.filters.keys())
