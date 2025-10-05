const BACKEND_URL = window.location.origin;

export interface VideoProcessResult {
  success: boolean;
  output_file?: string;
  path?: string;
  size?: number;
  error?: string;
}

export interface SubtitleData {
  success: boolean;
  subtitles?: Array<{
    index: number;
    start: string;
    end: string;
    text: string;
  }>;
  error?: string;
}

export class VideoAPI {
  private static async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${BACKEND_URL}/api/video/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('فشل رفع الملف');
    }
    
    const data = await response.json();
    return data.filename;
  }

  static async uploadVideo(file: File): Promise<string> {
    return this.uploadFile(file);
  }

  static async uploadAudio(file: File): Promise<string> {
    return this.uploadFile(file);
  }

  static async uploadSubtitle(file: File): Promise<string> {
    return this.uploadFile(file);
  }

  static async trimVideo(
    filename: string,
    startTime: number,
    endTime: number,
    outputFilename: string
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('start_time', startTime.toString());
    formData.append('end_time', endTime.toString());
    formData.append('output_filename', outputFilename);

    const response = await fetch(`${BACKEND_URL}/api/video/trim`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async mergeVideos(
    filenames: string[],
    outputFilename: string
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('filenames', filenames.join(','));
    formData.append('output_filename', outputFilename);

    const response = await fetch(`${BACKEND_URL}/api/video/concatenate`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async rotateVideo(
    filename: string,
    angle: number,
    outputFilename: string
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('angle', angle.toString());
    formData.append('output_filename', outputFilename);

    const response = await fetch(`${BACKEND_URL}/api/video/rotate`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async speedVideo(
    filename: string,
    speed: number,
    outputFilename: string
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('speed', speed.toString());
    formData.append('output_filename', outputFilename);

    const response = await fetch(`${BACKEND_URL}/api/video/speed`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async addSubtitles(
    videoFilename: string,
    subtitleFilename: string,
    outputFilename: string,
    options: {
      fontsize?: number;
      color?: string;
      position?: string;
    } = {}
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('video_filename', videoFilename);
    formData.append('subtitle_filename', subtitleFilename);
    formData.append('output_filename', outputFilename);
    formData.append('fontsize', (options.fontsize || 24).toString());
    formData.append('color', options.color || 'white');
    formData.append('position', options.position || 'bottom');

    const response = await fetch(`${BACKEND_URL}/api/subtitle/add-to-video`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async exportVideo(
    filename: string,
    outputFilename: string,
    options: {
      quality?: string;
      format?: string;
      fps?: number;
      audio_bitrate?: string;
    } = {}
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('output_filename', outputFilename);
    formData.append('quality', options.quality || '1080p');
    formData.append('format', options.format || 'mp4');
    if (options.fps) formData.append('fps', options.fps.toString());
    formData.append('audio_bitrate', options.audio_bitrate || '192k');

    const response = await fetch(`${BACKEND_URL}/api/export/video`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async extractAudio(
    filename: string,
    outputFilename: string
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('output_filename', outputFilename);

    const response = await fetch(`${BACKEND_URL}/api/audio/extract`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async addBackgroundMusic(
    videoFilename: string,
    audioFilename: string,
    outputFilename: string,
    musicVolume: number = 0.3,
    originalVolume: number = 1.0
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('video_filename', videoFilename);
    formData.append('audio_filename', audioFilename);
    formData.append('output_filename', outputFilename);
    formData.append('music_volume', musicVolume.toString());
    formData.append('original_volume', originalVolume.toString());

    const response = await fetch(`${BACKEND_URL}/api/audio/background`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async adjustVolume(
    filename: string,
    outputFilename: string,
    volume: number
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('output_filename', outputFilename);
    formData.append('volume', volume.toString());

    const response = await fetch(`${BACKEND_URL}/api/audio/volume`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async applyFilter(
    filename: string,
    outputFilename: string,
    filterType: string,
    intensity: number = 1.0
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('output_filename', outputFilename);
    formData.append('filter_type', filterType);
    formData.append('intensity', intensity.toString());

    const response = await fetch(`${BACKEND_URL}/api/effects/filter`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async applyTransition(
    clip1Filename: string,
    clip2Filename: string,
    outputFilename: string,
    transitionType: string = 'fade',
    duration: number = 1.0
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('clip1_filename', clip1Filename);
    formData.append('clip2_filename', clip2Filename);
    formData.append('output_filename', outputFilename);
    formData.append('transition_type', transitionType);
    formData.append('duration', duration.toString());

    const response = await fetch(`${BACKEND_URL}/api/effects/transition`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async addTextOverlay(
    filename: string,
    outputFilename: string,
    text: string,
    options: {
      position_x?: string;
      position_y?: string;
      fontsize?: number;
      color?: string;
      duration?: number;
    } = {}
  ): Promise<VideoProcessResult> {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('output_filename', outputFilename);
    formData.append('text', text);
    formData.append('position_x', options.position_x || 'center');
    formData.append('position_y', options.position_y || 'bottom');
    formData.append('fontsize', (options.fontsize || 50).toString());
    formData.append('color', options.color || 'white');
    if (options.duration) formData.append('duration', options.duration.toString());

    const response = await fetch(`${BACKEND_URL}/api/effects/text`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  static async getAvailableQualities(): Promise<string[]> {
    const response = await fetch(`${BACKEND_URL}/api/export/qualities`);
    const data = await response.json();
    return data.qualities;
  }

  static async getAvailableFormats(): Promise<string[]> {
    const response = await fetch(`${BACKEND_URL}/api/export/formats`);
    const data = await response.json();
    return data.formats;
  }

  static async getAvailableFilters(): Promise<string[]> {
    const response = await fetch(`${BACKEND_URL}/api/effects/filters`);
    const data = await response.json();
    return data.filters;
  }

  static async getAvailableTransitions(): Promise<string[]> {
    const response = await fetch(`${BACKEND_URL}/api/effects/transitions`);
    const data = await response.json();
    return data.transitions;
  }

  static getDownloadUrl(filename: string): string {
    return `${BACKEND_URL}/api/download/${filename}`;
  }

  static async checkHealth(): Promise<{ status: string; ffmpeg_installed?: boolean; python_version?: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      return response.json();
    } catch (error) {
      return { status: 'error' };
    }
  }
}
