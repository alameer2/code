import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Download, FileVideo, CheckCircle2, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { VideoAPI } from "@/lib/videoApi";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoFilename?: string;
}

export function ExportDialog({ open, onOpenChange, videoFilename }: ExportDialogProps) {
  const [quality, setQuality] = useState("1080p");
  const [format, setFormat] = useState("mp4");
  const [fps, setFps] = useState("30");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputFile, setOutputFile] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!videoFilename) {
      toast({
        title: "خطأ",
        description: "لا يوجد فيديو للتصدير",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    setProgress(0);
    setCompleted(false);
    setError(null);

    try {
      const outputFilename = `export_${quality}_${Date.now()}.${format}`;
      
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const result = await VideoAPI.exportVideo(
        videoFilename,
        outputFilename,
        {
          quality,
          format,
          fps: parseInt(fps),
          audio_bitrate: "192k",
        }
      );

      clearInterval(progressInterval);

      if (result.success && result.output_file) {
        setProgress(100);
        setOutputFile(result.output_file);
        setTimeout(() => {
          setExporting(false);
          setCompleted(true);
        }, 500);
        
        toast({
          title: "نجح التصدير",
          description: "تم تصدير الفيديو بنجاح",
        });
      } else {
        throw new Error(result.error || "فشل التصدير");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء التصدير";
      setError(errorMessage);
      setExporting(false);
      toast({
        title: "فشل التصدير",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setProgress(0);
    setExporting(false);
    setCompleted(false);
    setError(null);
    setOutputFile(null);
  };

  const handleDownload = () => {
    if (outputFile) {
      const downloadUrl = VideoAPI.getDownloadUrl(outputFile);
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="dialog-export">
        <DialogHeader>
          <DialogTitle>تصدير المشروع</DialogTitle>
          <DialogDescription>
            اختر إعدادات التصدير المناسبة لمشروعك
          </DialogDescription>
        </DialogHeader>

        {!completed ? (
          <>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>جودة الفيديو</Label>
                <RadioGroup value={quality} onValueChange={setQuality}>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="720p" id="720p" data-testid="radio-720p" />
                    <Label htmlFor="720p" className="font-normal cursor-pointer">
                      HD 720p (1280×720)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="1080p" id="1080p" data-testid="radio-1080p" />
                    <Label htmlFor="1080p" className="font-normal cursor-pointer">
                      Full HD 1080p (1920×1080)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="4k" id="4k" data-testid="radio-4k" />
                    <Label htmlFor="4k" className="font-normal cursor-pointer">
                      4K UHD (3840×2160)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">الصيغة</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format" data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                    <SelectItem value="webm">WebM (VP9)</SelectItem>
                    <SelectItem value="mov">MOV (ProRes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fps">معدل الإطارات</Label>
                <Select value={fps} onValueChange={setFps}>
                  <SelectTrigger id="fps" data-testid="select-fps">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {exporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">جاري التصدير...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} data-testid="progress-export" />
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={exporting}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleExport}
                disabled={exporting}
                data-testid="button-start-export"
              >
                <Download className="h-4 w-4 ml-2" />
                {exporting ? "جاري التصدير..." : "تصدير الآن"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-500/10 p-4 rounded-full">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">تم التصدير بنجاح!</h3>
                <p className="text-sm text-muted-foreground">
                  الملف جاهز للتحميل
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-4">
                <Button onClick={handleDownload} data-testid="button-download-file">
                  <FileVideo className="h-4 w-4 ml-2" />
                  تحميل الملف
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleReset();
                    onOpenChange(false);
                  }}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
