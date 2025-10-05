from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from pathlib import Path
import uuid
import uvicorn

from video_processor import VideoProcessor
from subtitle_processor import SubtitleProcessor
from export_processor import ExportProcessor
from audio_processor import AudioProcessor
from content_library import ContentLibrary

app = FastAPI(title="Video Editor API", version="1.0.0")

video_processor = VideoProcessor()
subtitle_processor = SubtitleProcessor()
export_processor = ExportProcessor()
audio_processor = AudioProcessor()
content_library = ContentLibrary()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("../uploads")
PROCESSED_DIR = Path("../processed")
UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Video Editor API - محرك معالجة الفيديو", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ffmpeg_installed": shutil.which("ffmpeg") is not None,
        "python_version": "3.11"
    }

@app.post("/api/video/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "success": True,
            "filename": unique_filename,
            "original_name": file.filename,
            "path": str(file_path),
            "size": os.path.getsize(file_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في رفع الملف: {str(e)}")

@app.post("/api/video/info")
async def get_video_info(filename: str = Form(...)):
    result = video_processor.get_video_info(filename)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/video/trim")
async def trim_video(
    filename: str = Form(...),
    start_time: float = Form(...),
    end_time: float = Form(...),
    output_filename: str = Form(...)
):
    result = video_processor.trim_video(filename, start_time, end_time, output_filename)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/video/concatenate")
async def concatenate_videos(
    filenames: str = Form(...),
    output_filename: str = Form(...)
):
    filename_list = filenames.split(',')
    result = video_processor.concatenate_videos(filename_list, output_filename)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/video/speed")
async def change_video_speed(
    filename: str = Form(...),
    speed_factor: float = Form(...),
    output_filename: str = Form(...)
):
    result = video_processor.change_speed(filename, speed_factor, output_filename)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/video/rotate")
async def rotate_video(
    filename: str = Form(...),
    angle: int = Form(...),
    output_filename: str = Form(...)
):
    result = video_processor.rotate_video(filename, angle, output_filename)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/video/resize")
async def resize_video(
    filename: str = Form(...),
    width: int = Form(...),
    height: int = Form(...),
    output_filename: str = Form(...)
):
    result = video_processor.resize_video(filename, width, height, output_filename)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/subtitle/parse-srt")
async def parse_srt_file(filename: str = Form(...)):
    result = subtitle_processor.load_srt_file(filename)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/subtitle/add-to-video")
async def add_subtitles(
    video_filename: str = Form(...),
    subtitle_filename: str = Form(...),
    output_filename: str = Form(...),
    fontsize: int = Form(24),
    color: str = Form("white"),
    position: str = Form("bottom")
):
    subtitle_data = subtitle_processor.load_srt_file(subtitle_filename)
    if not subtitle_data.get("success"):
        raise HTTPException(status_code=500, detail=subtitle_data.get("error"))
    
    pos_map = {
        "top": ('center', 'top'),
        "center": ('center', 'center'),
        "bottom": ('center', 'bottom')
    }
    
    result = subtitle_processor.add_subtitles_to_video(
        video_filename,
        subtitle_data["subtitles"],
        output_filename,
        fontsize=fontsize,
        color=color,
        position=pos_map.get(position, ('center', 'bottom'))
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/export/video")
async def export_video(
    filename: str = Form(...),
    output_filename: str = Form(...),
    quality: str = Form("1080p"),
    format: str = Form("mp4"),
    fps: Optional[int] = Form(None),
    audio_bitrate: str = Form("192k")
):
    result = export_processor.export_video(
        filename,
        output_filename,
        quality=quality,
        format=format,
        fps=fps,
        audio_bitrate=audio_bitrate
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/export/custom")
async def export_custom(
    filename: str = Form(...),
    output_filename: str = Form(...),
    width: int = Form(...),
    height: int = Form(...),
    bitrate: str = Form("4000k"),
    fps: int = Form(30),
    format: str = Form("mp4")
):
    result = export_processor.export_with_custom_settings(
        filename,
        output_filename,
        width=width,
        height=height,
        bitrate=bitrate,
        fps=fps,
        format=format
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.get("/api/export/qualities")
async def get_qualities():
    return {"qualities": export_processor.get_available_qualities()}

@app.get("/api/export/formats")
async def get_formats():
    return {"formats": export_processor.get_available_formats()}

@app.post("/api/audio/extract")
async def extract_audio(
    filename: str = Form(...),
    output_filename: str = Form(...)
):
    result = audio_processor.extract_audio(filename, output_filename)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/audio/background")
async def add_background_music(
    video_filename: str = Form(...),
    audio_filename: str = Form(...),
    output_filename: str = Form(...),
    music_volume: float = Form(0.3),
    original_volume: float = Form(1.0)
):
    result = audio_processor.add_background_music(
        video_filename,
        audio_filename,
        output_filename,
        music_volume=music_volume,
        original_volume=original_volume
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/audio/volume")
async def adjust_volume(
    filename: str = Form(...),
    output_filename: str = Form(...),
    volume: float = Form(1.0)
):
    result = audio_processor.adjust_volume(filename, output_filename, volume=volume)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/audio/replace")
async def replace_audio(
    video_filename: str = Form(...),
    audio_filename: str = Form(...),
    output_filename: str = Form(...)
):
    result = audio_processor.replace_audio(video_filename, audio_filename, output_filename)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/audio/remove")
async def remove_audio(
    filename: str = Form(...),
    output_filename: str = Form(...)
):
    result = audio_processor.remove_audio(filename, output_filename)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/audio/fade")
async def fade_audio(
    filename: str = Form(...),
    output_filename: str = Form(...),
    fade_in_duration: float = Form(0),
    fade_out_duration: float = Form(0)
):
    result = audio_processor.fade_audio(
        filename,
        output_filename,
        fade_in_duration=fade_in_duration,
        fade_out_duration=fade_out_duration
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/effects/transition")
async def apply_transition(
    clip1_filename: str = Form(...),
    clip2_filename: str = Form(...),
    output_filename: str = Form(...),
    transition_type: str = Form("fade"),
    duration: float = Form(1.0)
):
    result = content_library.apply_transition(
        clip1_filename,
        clip2_filename,
        output_filename,
        transition_type=transition_type,
        duration=duration
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/effects/filter")
async def apply_filter(
    filename: str = Form(...),
    output_filename: str = Form(...),
    filter_type: str = Form(...),
    intensity: float = Form(1.0)
):
    result = content_library.apply_filter(
        filename,
        output_filename,
        filter_type=filter_type,
        intensity=intensity
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/effects/text")
async def add_text_overlay(
    filename: str = Form(...),
    output_filename: str = Form(...),
    text: str = Form(...),
    position_x: str = Form("center"),
    position_y: str = Form("bottom"),
    fontsize: int = Form(50),
    color: str = Form("white"),
    duration: Optional[float] = Form(None)
):
    position = (position_x, position_y)
    result = content_library.add_text_overlay(
        filename,
        output_filename,
        text=text,
        position=position,
        fontsize=fontsize,
        color=color,
        duration=duration
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/api/effects/sticker")
async def add_sticker(
    video_filename: str = Form(...),
    sticker_filename: str = Form(...),
    output_filename: str = Form(...),
    position_x: str = Form("center"),
    position_y: str = Form("center"),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    duration: Optional[float] = Form(None)
):
    position = (position_x, position_y)
    size = (width, height) if width and height else None
    
    result = content_library.add_sticker(
        video_filename,
        sticker_filename,
        output_filename,
        position=position,
        size=size,
        duration=duration
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.get("/api/effects/transitions")
async def get_transitions():
    return {"transitions": content_library.get_available_transitions()}

@app.get("/api/effects/filters")
async def get_filters():
    return {"filters": content_library.get_available_filters()}

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = PROCESSED_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="الملف غير موجود")
    return FileResponse(file_path, filename=filename)

@app.post("/api/import/youtube")
async def import_from_youtube(
    url: str = Form(...),
    download_subtitles: bool = Form(True),
    subtitle_lang: str = Form("ar"),
    quality: str = Form("best")
):
    """تنزيل فيديو من YouTube مع الترجمات"""
    try:
        import yt_dlp
        import re
        
        video_id = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', url)
        if not video_id:
            raise HTTPException(status_code=400, detail="رابط YouTube غير صالح")
        
        video_filename = f"youtube_{video_id.group(1)}.mp4"
        subtitle_filename = f"youtube_{video_id.group(1)}.{subtitle_lang}.srt"
        
        video_path = UPLOAD_DIR / video_filename
        subtitle_path = UPLOAD_DIR / subtitle_filename
        
        if quality == "best":
            format_string = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
        else:
            format_string = f'bestvideo[height<={quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<={quality}][ext=mp4]/best'
        
        ydl_opts = {
            'format': format_string,
            'outtmpl': str(video_path.with_suffix('')),
            'merge_output_format': 'mp4',
        }
        
        if download_subtitles:
            ydl_opts.update({
                'writesubtitles': True,
                'writeautomaticsub': True,
                'subtitleslangs': [subtitle_lang],
                'subtitlesformat': 'srt',
            })
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get('title', 'video')
        
        if not video_path.exists():
            video_path = video_path.with_suffix('.mp4')
        
        result = {
            "success": True,
            "video": {
                "filename": video_filename,
                "path": str(video_path),
                "title": title,
                "size": video_path.stat().st_size if video_path.exists() else 0
            }
        }
        
        if download_subtitles and subtitle_path.exists():
            result["subtitle"] = {
                "filename": subtitle_filename,
                "path": str(subtitle_path),
                "language": subtitle_lang
            }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في تنزيل الفيديو: {str(e)}")

@app.post("/api/import/gdrive")
async def import_from_google_drive(
    url: str = Form(...)
):
    """تنزيل ملف من Google Drive"""
    try:
        import gdown
        import re
        
        file_id_match = re.search(r'/file/d/([a-zA-Z0-9_-]+)', url) or \
                       re.search(r'id=([a-zA-Z0-9_-]+)', url)
        
        if not file_id_match:
            raise HTTPException(status_code=400, detail="رابط Google Drive غير صالح")
        
        file_id = file_id_match.group(1)
        temp_filename = f"gdrive_{file_id}"
        temp_path = UPLOAD_DIR / temp_filename
        
        output_path = gdown.download(id=file_id, output=str(temp_path), quiet=False)
        
        if not output_path:
            raise HTTPException(status_code=500, detail="فشل تنزيل الملف من Google Drive")
        
        actual_path = Path(output_path)
        file_extension = actual_path.suffix or '.mp4'
        final_filename = f"gdrive_{file_id}{file_extension}"
        final_path = UPLOAD_DIR / final_filename
        
        if actual_path != final_path:
            actual_path.rename(final_path)
        
        return {
            "success": True,
            "filename": final_filename,
            "path": str(final_path),
            "size": final_path.stat().st_size
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في تنزيل الملف: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
