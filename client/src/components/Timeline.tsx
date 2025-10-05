import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Scissors, Copy, Trash2, Plus, Video, Music, Type, Gauge, RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoAPI } from "@/lib/videoApi";
import { useToast } from "@/hooks/use-toast";

interface TimelineClip {
  id: string;
  type: "video" | "audio" | "subtitle" | "text";
  start: number;
  duration: number;
  label: string;
  color: string;
  filename?: string;
}

interface TimelineProps {
  videoFilename?: string;
}

export function Timeline({ videoFilename }: TimelineProps) {
  const [zoom, setZoom] = useState([50]);
  const [clips, setClips] = useState<TimelineClip[]>([
    {
      id: "1",
      type: "video",
      start: 0,
      duration: 30,
      label: "مقطع الافتتاحية",
      color: "bg-blue-500",
      filename: videoFilename,
    },
    {
      id: "2",
      type: "audio",
      start: 0,
      duration: 30,
      label: "موسيقى خلفية",
      color: "bg-green-500",
    },
    {
      id: "3",
      type: "subtitle",
      start: 5,
      duration: 10,
      label: "ترجمة المقدمة",
      color: "bg-yellow-500",
    },
  ]);

  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [trimDialogOpen, setTrimDialogOpen] = useState(false);
  const [trimStart, setTrimStart] = useState("0");
  const [trimEnd, setTrimEnd] = useState("10");
  const [trimming, setTrimming] = useState(false);
  
  const [speedDialogOpen, setSpeedDialogOpen] = useState(false);
  const [speed, setSpeed] = useState("1.0");
  const [speeding, setSpeeding] = useState(false);
  
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false);
  const [rotateAngle, setRotateAngle] = useState("90");
  const [rotating, setRotating] = useState(false);
  
  const { toast } = useToast();

  const tracks = [
    { type: "video", label: "فيديو", icon: Video },
    { type: "audio", label: "صوت", icon: Music },
    { type: "subtitle", label: "ترجمات", icon: Type },
  ];

  const handleDeleteClip = (id: string) => {
    setClips(clips.filter((c) => c.id !== id));
  };

  const handleDuplicateClip = (id: string) => {
    const clip = clips.find((c) => c.id === id);
    if (clip) {
      const newClip = {
        ...clip,
        id: Date.now().toString(),
        start: clip.start + clip.duration,
      };
      setClips([...clips, newClip]);
    }
  };

  const handleOpenTrimDialog = () => {
    const selectedClipData = clips.find((c) => c.id === selectedClip);
    if (selectedClipData && selectedClipData.type === 'video') {
      setTrimStart(selectedClipData.start.toString());
      setTrimEnd((selectedClipData.start + selectedClipData.duration).toString());
      setTrimDialogOpen(true);
    } else {
      toast({
        title: "تنبيه",
        description: "الرجاء تحديد مقطع فيديو للقص",
        variant: "destructive",
      });
    }
  };

  const handleTrim = async () => {
    const selectedClipData = clips.find((c) => c.id === selectedClip);
    if (!selectedClipData || !selectedClipData.filename) {
      toast({
        title: "خطأ",
        description: "لا يمكن قص المقطع",
        variant: "destructive",
      });
      return;
    }

    setTrimming(true);
    try {
      const outputFilename = `trimmed_${Date.now()}.mp4`;
      const result = await VideoAPI.trimVideo(
        selectedClipData.filename,
        parseFloat(trimStart),
        parseFloat(trimEnd),
        outputFilename
      );

      if (result.success && result.output_file) {
        toast({
          title: "نجح القص",
          description: "تم قص الفيديو بنجاح",
        });
        
        const newClip: TimelineClip = {
          id: Date.now().toString(),
          type: "video",
          start: 0,
          duration: parseFloat(trimEnd) - parseFloat(trimStart),
          label: "مقطع مقصوص",
          color: "bg-blue-500",
          filename: result.output_file,
        };
        setClips([...clips, newClip]);
        setTrimDialogOpen(false);
      } else {
        throw new Error(result.error || "فشل القص");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء القص";
      toast({
        title: "فشل القص",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTrimming(false);
    }
  };

  const handleOpenSpeedDialog = () => {
    const selectedClipData = clips.find((c) => c.id === selectedClip);
    if (selectedClipData && selectedClipData.type === 'video') {
      setSpeedDialogOpen(true);
    } else {
      toast({
        title: "تنبيه",
        description: "الرجاء تحديد مقطع فيديو لتغيير السرعة",
        variant: "destructive",
      });
    }
  };

  const handleSpeed = async () => {
    const selectedClipData = clips.find((c) => c.id === selectedClip);
    if (!selectedClipData || !selectedClipData.filename) {
      toast({
        title: "خطأ",
        description: "لا يمكن تغيير السرعة",
        variant: "destructive",
      });
      return;
    }

    setSpeeding(true);
    try {
      const outputFilename = `speed_${Date.now()}.mp4`;
      const result = await VideoAPI.speedVideo(
        selectedClipData.filename,
        parseFloat(speed),
        outputFilename
      );

      if (result.success && result.output_file) {
        toast({
          title: "نجح تغيير السرعة",
          description: `تم تغيير السرعة إلى ${speed}x`,
        });
        
        const newClip: TimelineClip = {
          id: Date.now().toString(),
          type: "video",
          start: 0,
          duration: selectedClipData.duration / parseFloat(speed),
          label: `سرعة ${speed}x`,
          color: "bg-blue-500",
          filename: result.output_file,
        };
        setClips([...clips, newClip]);
        setSpeedDialogOpen(false);
      } else {
        throw new Error(result.error || "فشل تغيير السرعة");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء تغيير السرعة";
      toast({
        title: "فشل تغيير السرعة",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSpeeding(false);
    }
  };

  const handleOpenRotateDialog = () => {
    const selectedClipData = clips.find((c) => c.id === selectedClip);
    if (selectedClipData && selectedClipData.type === 'video') {
      setRotateDialogOpen(true);
    } else {
      toast({
        title: "تنبيه",
        description: "الرجاء تحديد مقطع فيديو للتدوير",
        variant: "destructive",
      });
    }
  };

  const handleRotate = async () => {
    const selectedClipData = clips.find((c) => c.id === selectedClip);
    if (!selectedClipData || !selectedClipData.filename) {
      toast({
        title: "خطأ",
        description: "لا يمكن تدوير المقطع",
        variant: "destructive",
      });
      return;
    }

    setRotating(true);
    try {
      const outputFilename = `rotated_${Date.now()}.mp4`;
      const result = await VideoAPI.rotateVideo(
        selectedClipData.filename,
        parseInt(rotateAngle),
        outputFilename
      );

      if (result.success && result.output_file) {
        toast({
          title: "نجح التدوير",
          description: `تم تدوير الفيديو ${rotateAngle} درجة`,
        });
        
        const newClip: TimelineClip = {
          id: Date.now().toString(),
          type: "video",
          start: 0,
          duration: selectedClipData.duration,
          label: `مُدوّر ${rotateAngle}°`,
          color: "bg-blue-500",
          filename: result.output_file,
        };
        setClips([...clips, newClip]);
        setRotateDialogOpen(false);
      } else {
        throw new Error(result.error || "فشل التدوير");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء التدوير";
      toast({
        title: "فشل التدوير",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRotating(false);
    }
  };

  return (
    <div className="bg-card border-t border-border h-64 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleOpenTrimDialog}
            disabled={!selectedClip}
            data-testid="button-cut"
          >
            <Scissors className="h-4 w-4 ml-1" />
            قص
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleOpenSpeedDialog}
            disabled={!selectedClip}
            data-testid="button-speed"
          >
            <Gauge className="h-4 w-4 ml-1" />
            السرعة
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleOpenRotateDialog}
            disabled={!selectedClip}
            data-testid="button-rotate"
          >
            <RotateCw className="h-4 w-4 ml-1" />
            تدوير
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => selectedClip && handleDuplicateClip(selectedClip)}
            disabled={!selectedClip}
            data-testid="button-copy"
          >
            <Copy className="h-4 w-4 ml-1" />
            نسخ
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => selectedClip && handleDeleteClip(selectedClip)}
            disabled={!selectedClip}
            data-testid="button-delete"
          >
            <Trash2 className="h-4 w-4 ml-1" />
            حذف
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">التكبير:</span>
          <Slider
            value={zoom}
            onValueChange={setZoom}
            max={100}
            step={1}
            className="w-32"
            data-testid="slider-zoom"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {tracks.map((track) => {
          const Icon = track.icon;
          const trackClips = clips.filter((c) => c.type === track.type);

          return (
            <div
              key={track.type}
              className="flex border-b border-border hover:bg-muted/50 transition-colors"
              data-testid={`track-${track.type}`}
            >
              <div className="w-32 flex items-center gap-2 px-4 py-3 border-l border-border bg-card sticky right-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{track.label}</span>
              </div>

              <div className="flex-1 relative h-16 bg-muted/20">
                {trackClips.map((clip) => {
                  const widthPercent = (clip.duration / 60) * zoom[0];
                  const leftPercent = (clip.start / 60) * zoom[0];

                  return (
                    <div
                      key={clip.id}
                      className={`absolute top-1 bottom-1 ${clip.color} rounded-md px-2 flex items-center justify-between cursor-move hover-elevate active-elevate-2 transition-all ${
                        selectedClip === clip.id ? "ring-2 ring-primary" : ""
                      }`}
                      style={{
                        right: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        minWidth: "80px",
                      }}
                      onClick={() => setSelectedClip(clip.id)}
                      data-testid={`clip-${clip.id}`}
                    >
                      <span className="text-xs font-medium text-white truncate">
                        {clip.label}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateClip(clip.id);
                          }}
                        >
                          <Copy className="h-3 w-3 text-white" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClip(clip.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-white" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-1/2 left-4 -translate-y-1/2 h-8 w-8 opacity-0 hover:opacity-100 transition-opacity"
                  data-testid={`button-add-${track.type}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-border flex items-center justify-center gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          00:00:00
        </Badge>
        <span className="text-xs text-muted-foreground">/</span>
        <Badge variant="outline" className="font-mono text-xs">
          00:00:{clips.length > 0 ? Math.max(...clips.map((c) => c.start + c.duration)).toString().padStart(2, "0") : "00"}
        </Badge>
      </div>

      <Dialog open={trimDialogOpen} onOpenChange={setTrimDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>قص الفيديو</DialogTitle>
            <DialogDescription>
              حدد وقت البداية والنهاية لقص المقطع
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trim-start">وقت البداية (بالثواني)</Label>
              <Input
                id="trim-start"
                type="number"
                value={trimStart}
                onChange={(e) => setTrimStart(e.target.value)}
                disabled={trimming}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trim-end">وقت النهاية (بالثواني)</Label>
              <Input
                id="trim-end"
                type="number"
                value={trimEnd}
                onChange={(e) => setTrimEnd(e.target.value)}
                disabled={trimming}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTrimDialogOpen(false)}
              disabled={trimming}
            >
              إلغاء
            </Button>
            <Button onClick={handleTrim} disabled={trimming}>
              {trimming ? "جاري القص..." : "قص"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={speedDialogOpen} onOpenChange={setSpeedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير سرعة الفيديو</DialogTitle>
            <DialogDescription>
              اختر السرعة المطلوبة للفيديو
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="speed">السرعة</Label>
              <Select value={speed} onValueChange={setSpeed} disabled={speeding}>
                <SelectTrigger id="speed">
                  <SelectValue placeholder="اختر السرعة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25x (بطيء جداً)</SelectItem>
                  <SelectItem value="0.5">0.5x (بطيء)</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1.0">1.0x (عادي)</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x (سريع)</SelectItem>
                  <SelectItem value="2.0">2.0x (سريع جداً)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSpeedDialogOpen(false)}
              disabled={speeding}
            >
              إلغاء
            </Button>
            <Button onClick={handleSpeed} disabled={speeding}>
              {speeding ? "جاري التطبيق..." : "تطبيق"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rotateDialogOpen} onOpenChange={setRotateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تدوير الفيديو</DialogTitle>
            <DialogDescription>
              اختر زاوية التدوير للفيديو
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rotate">زاوية التدوير</Label>
              <Select value={rotateAngle} onValueChange={setRotateAngle} disabled={rotating}>
                <SelectTrigger id="rotate">
                  <SelectValue placeholder="اختر الزاوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90° (يمين)</SelectItem>
                  <SelectItem value="180">180° (مقلوب)</SelectItem>
                  <SelectItem value="270">270° (يسار)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRotateDialogOpen(false)}
              disabled={rotating}
            >
              إلغاء
            </Button>
            <Button onClick={handleRotate} disabled={rotating}>
              {rotating ? "جاري التدوير..." : "تدوير"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
