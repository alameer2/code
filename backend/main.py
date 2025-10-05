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

app = FastAPI(title="Video Editor API", version="1.0.0")

video_processor = VideoProcessor()
subtitle_processor = SubtitleProcessor()

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

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = PROCESSED_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="الملف غير موجود")
    return FileResponse(file_path, filename=filename)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
