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
import { Upload, Link2, Video, Music, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (file: File | string, type: "local" | "url") => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"local" | "url">("local");
  const [projectTitle, setProjectTitle] = useState("");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const createProjectMutation = useMutation({
    mutationFn: async (data: { title: string; file?: File }) => {
      const res = await apiRequest("POST", "/api/projects", {
        title: data.title,
        status: "draft",
      });
      const project = await res.json();
      
      if (data.file) {
        const formData = new FormData();
        formData.append("file", data.file);
        formData.append("projectId", project.id);
        
        await fetch("/api/upload", {
          method: "POST",
          body: formData,
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
      setProjectTitle("");
      setUrl("");
      setUploading(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" data-testid="dialog-upload">
        <DialogHeader>
          <DialogTitle>إنشاء مشروع جديد</DialogTitle>
          <DialogDescription>
            أدخل اسم المشروع واختر ملف فيديو (اختياري)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">جاري الرفع...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} data-testid="progress-upload" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
