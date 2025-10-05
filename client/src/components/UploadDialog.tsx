import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link2, Video, Folder } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { VideoAPI } from "@/lib/videoApi";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { File as ProjectFile } from "@shared/schema";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export function UploadDialog({ open, onOpenChange, projectId }: UploadDialogProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"local" | "gdrive" | "youtube" | "project">("local");
  const [projectTitle, setProjectTitle] = useState("");
  const [url, setUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadSubtitles, setDownloadSubtitles] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState("ar");
  const [videoQuality, setVideoQuality] = useState("best");
  const [selectedProjectFile, setSelectedProjectFile] = useState<string>("");
  const { toast } = useToast();

  const { data: projectFiles = [] } = useQuery<ProjectFile[]>({
    queryKey: ["/api/projects", projectId, "files"],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await fetch(`/api/projects/${projectId}/files`);
      if (!res.ok) throw new Error("Failed to fetch files");
      return res.json();
    },
    enabled: !!projectId && activeTab === "project",
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: { title: string; file?: File }) => {
      const res = await apiRequest("POST", "/api/projects", {
        title: data.title,
        status: "draft",
      });
      const project = await res.json();
      
      if (data.file) {
        const fileType = data.file.type;
        let filename: string;
        
        if (fileType.startsWith("video")) {
          filename = await VideoAPI.uploadVideo(data.file);
        } else if (fileType.startsWith("audio")) {
          filename = await VideoAPI.uploadAudio(data.file);
        } else {
          filename = await VideoAPI.uploadSubtitle(data.file);
        }
        
        const fileUrl = `/uploads/${filename}`;
        await apiRequest("POST", "/api/files", {
          projectId: project.id,
          name: data.file.name,
          type: fileType.startsWith("video") ? "video" : 
                fileType.startsWith("audio") ? "audio" : "subtitle",
          size: data.file.size,
          url: fileUrl,
        });
      }
      
      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "تم إنشاء المشروع بنجاح",
      });
      onOpenChange(false);
      resetForm();
      setLocation(`/editor?id=${project.id}`);
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء المشروع",
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const importFromYoutubeMutation = useMutation({
    mutationFn: async (data: { url: string; downloadSubtitles: boolean; subtitleLang: string; quality: string }) => {
      const formData = new FormData();
      formData.append("url", data.url);
      formData.append("download_subtitles", data.downloadSubtitles.toString());
      formData.append("subtitle_lang", data.subtitleLang);
      formData.append("quality", data.quality);

      const res = await fetch("http://localhost:8000/api/import/youtube", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to import from YouTube");
      }

      return res.json();
    },
    onSuccess: async (data) => {
      let targetProjectId = projectId;
      
      if (!targetProjectId) {
        const res = await apiRequest("POST", "/api/projects", {
          title: data.video.title || "مشروع YouTube",
          status: "draft",
        });
        const newProject = await res.json();
        targetProjectId = newProject.id;
      }

      await apiRequest("POST", "/api/files", {
        projectId: targetProjectId,
        name: data.video.title || data.video.filename,
        type: "video",
        size: data.video.size,
        url: `/uploads/${data.video.filename}`,
      });

      if (data.subtitle) {
        await apiRequest("POST", "/api/files", {
          projectId: targetProjectId,
          name: data.subtitle.filename,
          type: "subtitle",
          size: 0,
          url: `/uploads/${data.subtitle.filename}`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "files"] });
      }

      toast({
        title: "تم الاستيراد من YouTube بنجاح",
      });
      onOpenChange(false);
      resetForm();
      
      if (!projectId) {
        setLocation(`/editor?id=${targetProjectId}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الاستيراد من YouTube",
        description: error.message,
        variant: "destructive",
      });
      setDownloading(false);
    },
  });

  const importFromGDriveMutation = useMutation({
    mutationFn: async (url: string) => {
      const formData = new FormData();
      formData.append("url", url);

      const res = await fetch("http://localhost:8000/api/import/gdrive", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to import from Google Drive");
      }

      return res.json();
    },
    onSuccess: async (data) => {
      let targetProjectId = projectId;
      
      if (!targetProjectId) {
        const res = await apiRequest("POST", "/api/projects", {
          title: data.filename.replace(/\.[^/.]+$/, "") || "مشروع Google Drive",
          status: "draft",
        });
        const newProject = await res.json();
        targetProjectId = newProject.id;
      }

      await apiRequest("POST", "/api/files", {
        projectId: targetProjectId,
        name: data.filename,
        type: data.filename.endsWith('.mp4') || data.filename.endsWith('.mov') ? "video" : "file",
        size: data.size,
        url: `/uploads/${data.filename}`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "files"] });
      }

      toast({
        title: "تم الاستيراد من Google Drive بنجاح",
      });
      onOpenChange(false);
      resetForm();
      
      if (!projectId) {
        setLocation(`/editor?id=${targetProjectId}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الاستيراد من Google Drive",
        description: error.message,
        variant: "destructive",
      });
      setDownloading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && projectTitle.trim()) {
      setUploading(true);
      createProjectMutation.mutate({ title: projectTitle, file });
    }
  };

  const handleCreateProject = () => {
    if (projectTitle.trim()) {
      setUploading(true);
      createProjectMutation.mutate({ title: projectTitle });
    }
  };

  const handleYoutubeImport = () => {
    if (url.trim()) {
      setDownloading(true);
      importFromYoutubeMutation.mutate({
        url,
        downloadSubtitles,
        subtitleLang,
        quality: videoQuality,
      });
    }
  };

  const handleGDriveImport = () => {
    if (url.trim()) {
      setDownloading(true);
      importFromGDriveMutation.mutate(url);
    }
  };

  const handleProjectFileSelect = async () => {
    if (!selectedProjectFile || !projectId) return;
    
    const selectedFile = projectFiles.find(f => f.id === selectedProjectFile);
    if (!selectedFile) return;

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setProjectTitle("");
    setUrl("");
    setUploading(false);
    setDownloading(false);
    setProgress(0);
    setSelectedProjectFile("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="dialog-upload">
        <DialogHeader>
          <DialogTitle>استيراد ملف</DialogTitle>
          <DialogDescription>
            اختر طريقة الاستيراد المناسبة
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="local">
              <Upload className="h-4 w-4 ml-2" />
              رفع ملف
            </TabsTrigger>
            <TabsTrigger value="gdrive">
              <Folder className="h-4 w-4 ml-2" />
              Google Drive
            </TabsTrigger>
            <TabsTrigger value="youtube">
              <Video className="h-4 w-4 ml-2" />
              YouTube
            </TabsTrigger>
            <TabsTrigger value="project" disabled={!projectId}>
              <Link2 className="h-4 w-4 ml-2" />
              من المشروع
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">اسم المشروع</Label>
              <Input
                id="project-title"
                placeholder="مثال: فيديو ترويجي للمنتج"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                data-testid="input-project-title"
              />
            </div>

            <div className="space-y-2">
              <Label>رفع ملف فيديو (اختياري)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors">
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="video/*,audio/*,.srt,.vtt,.ass"
                  onChange={handleFileSelect}
                  disabled={!projectTitle.trim()}
                  data-testid="input-file"
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${!projectTitle.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">اضغط لاختيار ملف</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, MOV, AVI, MP3, WAV, SRT
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              onClick={handleCreateProject}
              disabled={!projectTitle.trim() || uploading}
              className="w-full"
              data-testid="button-create-project"
            >
              {uploading ? "جاري الإنشاء..." : "إنشاء مشروع"}
            </Button>
          </TabsContent>

          <TabsContent value="gdrive" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="gdrive-url">رابط Google Drive</Label>
              <Input
                id="gdrive-url"
                placeholder="https://drive.google.com/file/d/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                الصق رابط ملف مشترك من Google Drive
              </p>
            </div>

            <Button
              onClick={handleGDriveImport}
              disabled={!url.trim() || downloading}
              className="w-full"
            >
              {downloading ? "جاري التنزيل..." : "استيراد من Google Drive"}
            </Button>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">رابط YouTube</Label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-quality">جودة الفيديو</Label>
              <Select value={videoQuality} onValueChange={setVideoQuality}>
                <SelectTrigger id="video-quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best">أفضل جودة متاحة</SelectItem>
                  <SelectItem value="2160">4K (2160p)</SelectItem>
                  <SelectItem value="1440">2K (1440p)</SelectItem>
                  <SelectItem value="1080">Full HD (1080p)</SelectItem>
                  <SelectItem value="720">HD (720p)</SelectItem>
                  <SelectItem value="480">SD (480p)</SelectItem>
                  <SelectItem value="360">360p</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="download-subs"
                checked={downloadSubtitles}
                onCheckedChange={(checked) => setDownloadSubtitles(checked as boolean)}
              />
              <Label htmlFor="download-subs" className="cursor-pointer">
                تنزيل الترجمات
              </Label>
            </div>

            {downloadSubtitles && (
              <div className="space-y-2">
                <Label htmlFor="subtitle-lang">لغة الترجمة</Label>
                <Select value={subtitleLang} onValueChange={setSubtitleLang}>
                  <SelectTrigger id="subtitle-lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleYoutubeImport}
              disabled={!url.trim() || downloading}
              className="w-full"
            >
              {downloading ? "جاري التنزيل..." : "استيراد من YouTube"}
            </Button>
          </TabsContent>

          <TabsContent value="project" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="project-file">اختر ملف من المشروع</Label>
              <Select value={selectedProjectFile} onValueChange={setSelectedProjectFile}>
                <SelectTrigger id="project-file">
                  <SelectValue placeholder="اختر ملف" />
                </SelectTrigger>
                <SelectContent>
                  {projectFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id!}>
                      {file.name} ({file.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleProjectFileSelect}
              disabled={!selectedProjectFile}
              className="w-full"
            >
              استخدام الملف
            </Button>
          </TabsContent>
        </Tabs>

        {(uploading || downloading) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {uploading ? "جاري الرفع..." : "جاري التنزيل..."}
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} data-testid="progress-upload" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
