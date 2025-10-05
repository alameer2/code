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

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File | string, type: "local" | "url") => void;
}

export function UploadDialog({ open, onOpenChange, onUpload }: UploadDialogProps) {
  const [activeTab, setActiveTab] = useState<"local" | "url">("local");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploading(false);
              onUpload(file, "local");
              onOpenChange(false);
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleUrlSubmit = () => {
    if (url.trim()) {
      setUploading(true);
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploading(false);
              onUpload(url, "url");
              onOpenChange(false);
              setUrl("");
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" data-testid="dialog-upload">
        <DialogHeader>
          <DialogTitle>رفع ملف جديد</DialogTitle>
          <DialogDescription>
            اختر ملف فيديو أو صوت أو ترجمة من جهازك أو عبر رابط مباشر
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "local" | "url")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" data-testid="tab-local">
              <Upload className="h-4 w-4 ml-2" />
              من الجهاز
            </TabsTrigger>
            <TabsTrigger value="url" data-testid="tab-url">
              <Link2 className="h-4 w-4 ml-2" />
              من رابط
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate transition-colors">
              <Input
                type="file"
                id="file-upload"
                className="hidden"
                accept="video/*,audio/*,.srt,.vtt,.ass"
                onChange={handleFileSelect}
                data-testid="input-file"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="bg-primary/10 p-4 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">اضغط لاختيار ملف أو اسحب وأفلت هنا</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    الصيغ المدعومة: MP4, MOV, AVI, MP3, WAV, SRT, VTT, ASS
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 border rounded-md bg-card">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">فيديو</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-card">
                <Music className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">صوت</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-card">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">ترجمة</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="url-input">الرابط المباشر</Label>
              <Input
                id="url-input"
                placeholder="https://drive.google.com/file/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-testid="input-url"
              />
              <p className="text-xs text-muted-foreground">
                يدعم روابط Google Drive, Dropbox, والروابط المباشرة الأخرى
              </p>
            </div>

            <Button
              onClick={handleUrlSubmit}
              disabled={!url.trim() || uploading}
              className="w-full"
              data-testid="button-submit-url"
            >
              <Link2 className="h-4 w-4 ml-2" />
              إضافة من الرابط
            </Button>
          </TabsContent>
        </Tabs>

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
