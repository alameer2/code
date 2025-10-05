import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Download, Upload, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoAPI } from "@/lib/videoApi";
import { useToast } from "@/hooks/use-toast";

interface Subtitle {
  id: string;
  startTime: string;
  endTime: string;
  text: string;
}

interface SubtitleEditorProps {
  videoFilename?: string;
  onVideoProcessed?: (filename: string) => void;
}

export function SubtitleEditor({ videoFilename, onVideoProcessed }: SubtitleEditorProps) {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([
    { id: "1", startTime: "00:00:00.000", endTime: "00:00:03.000", text: "مرحباً بكم في محرر الترجمة الاحترافي" },
    { id: "2", startTime: "00:00:03.500", endTime: "00:00:07.000", text: "يمكنك تحرير التوقيت والنص بسهولة" },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>("1");
  const [fontSize, setFontSize] = useState([32]);
  const [fontFamily, setFontFamily] = useState("Cairo");
  const [position, setPosition] = useState("bottom");
  const [color, setColor] = useState("white");
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSubtitle = () => {
    const newSubtitle: Subtitle = {
      id: Date.now().toString(),
      startTime: "00:00:00.000",
      endTime: "00:00:02.000",
      text: "نص جديد",
    };
    setSubtitles([...subtitles, newSubtitle]);
    setSelectedId(newSubtitle.id);
  };

  const deleteSubtitle = (id: string) => {
    setSubtitles(subtitles.filter((s) => s.id !== id));
    if (selectedId === id) {
      setSelectedId(subtitles[0]?.id || null);
    }
  };

  const updateSubtitle = (id: string, field: keyof Subtitle, value: string) => {
    setSubtitles(
      subtitles.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const selected = subtitles.find((s) => s.id === selectedId);

  const handleImportSubtitle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedSubtitles = parseSRT(text);
      
      if (parsedSubtitles.length > 0) {
        setSubtitles(parsedSubtitles);
        setSelectedId(parsedSubtitles[0]?.id || null);
        toast({
          title: "نجح الاستيراد",
          description: `تم استيراد ${parsedSubtitles.length} ترجمة`,
        });
      } else {
        throw new Error("الملف فارغ أو بصيغة غير صحيحة");
      }
    } catch (err) {
      toast({
        title: "فشل الاستيراد",
        description: err instanceof Error ? err.message : "حدث خطأ",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const parseSRT = (content: string): Subtitle[] => {
    const blocks = content.trim().split(/\r?\n\r?\n/);
    const subtitles: Subtitle[] = [];

    blocks.forEach((block, index) => {
      const lines = block.trim().split(/\r?\n/);
      if (lines.length >= 3) {
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/);
        if (timeMatch) {
          subtitles.push({
            id: `sub_${index + 1}`,
            startTime: timeMatch[1].replace(',', '.'),
            endTime: timeMatch[2].replace(',', '.'),
            text: lines.slice(2).join('\n'),
          });
        }
      }
    });

    return subtitles;
  };

  const handleApplySubtitles = async () => {
    if (!videoFilename) {
      toast({
        title: "تنبيه",
        description: "لا يوجد فيديو لتطبيق الترجمات عليه",
        variant: "destructive",
      });
      return;
    }

    setApplying(true);
    try {
      const srtContent = subtitles.map((sub, index) => {
        return `${index + 1}\n${sub.startTime} --> ${sub.endTime}\n${sub.text}\n`;
      }).join('\n');

      const blob = new Blob([srtContent], { type: 'text/plain' });
      const file = new File([blob], 'subtitles.srt', { type: 'text/plain' });
      
      const subtitleFilename = await VideoAPI.uploadSubtitle(file);
      
      const outputFilename = `subtitled_${Date.now()}.mp4`;
      const result = await VideoAPI.addSubtitles(
        videoFilename,
        subtitleFilename,
        outputFilename,
        {
          fontsize: fontSize[0],
          color: color,
          position: position,
        }
      );

      if (result.success && result.output_file) {
        toast({
          title: "نجح تطبيق الترجمات",
          description: "تم إضافة الترجمات للفيديو بنجاح",
        });
        if (onVideoProcessed) {
          onVideoProcessed(result.output_file);
        }
      } else {
        throw new Error(result.error || "فشل تطبيق الترجمات");
      }
    } catch (err) {
      toast({
        title: "فشل تطبيق الترجمات",
        description: err instanceof Error ? err.message : "حدث خطأ",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">محرر الترجمات</h3>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".srt,.vtt,.ass"
            className="hidden"
            onChange={handleImportSubtitle}
          />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-import-subtitle"
          >
            <Upload className="h-4 w-4 ml-1" />
            استيراد
          </Button>
          <Button 
            size="sm" 
            variant="default" 
            onClick={handleApplySubtitles}
            disabled={applying || !videoFilename}
            data-testid="button-apply-subtitle"
          >
            <Check className="h-4 w-4 ml-1" />
            {applying ? "جاري التطبيق..." : "تطبيق"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="list" className="flex-1">
            القائمة
          </TabsTrigger>
          <TabsTrigger value="style" className="flex-1">
            التنسيق
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="flex-1 flex flex-col m-0 p-4">
          <Button
            onClick={addSubtitle}
            variant="outline"
            className="w-full mb-3"
            data-testid="button-add-subtitle"
          >
            <Plus className="h-4 w-4 ml-1" />
            إضافة ترجمة جديدة
          </Button>

          <ScrollArea className="flex-1 -mx-4 px-4">
            <div className="space-y-2">
              {subtitles.map((subtitle, index) => (
                <div
                  key={subtitle.id}
                  className={`p-3 border rounded-md cursor-pointer transition-all hover-elevate ${
                    selectedId === subtitle.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedId(subtitle.id)}
                  data-testid={`subtitle-item-${subtitle.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      #{index + 1}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSubtitle(subtitle.id);
                      }}
                      data-testid={`button-delete-subtitle-${subtitle.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm mb-2 leading-relaxed">{subtitle.text}</p>
                  <div className="flex gap-2 text-xs font-mono text-muted-foreground">
                    <span>{subtitle.startTime}</span>
                    <span>←</span>
                    <span>{subtitle.endTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selected && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1">وقت البداية</Label>
                  <Input
                    value={selected.startTime}
                    onChange={(e) =>
                      updateSubtitle(selected.id, "startTime", e.target.value)
                    }
                    className="font-mono text-xs"
                    data-testid="input-start-time"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1">وقت النهاية</Label>
                  <Input
                    value={selected.endTime}
                    onChange={(e) =>
                      updateSubtitle(selected.id, "endTime", e.target.value)
                    }
                    className="font-mono text-xs"
                    data-testid="input-end-time"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1">النص</Label>
                <Textarea
                  value={selected.text}
                  onChange={(e) =>
                    updateSubtitle(selected.id, "text", e.target.value)
                  }
                  className="resize-none"
                  rows={3}
                  data-testid="textarea-subtitle-text"
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="style" className="flex-1 m-0 p-4 space-y-4">
          <div>
            <Label className="text-sm mb-2">الخط</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger data-testid="select-font">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cairo">Cairo</SelectItem>
                <SelectItem value="Tajawal">Tajawal</SelectItem>
                <SelectItem value="Amiri">Amiri</SelectItem>
                <SelectItem value="Almarai">Almarai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2">حجم الخط: {fontSize[0]}px</Label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              min={16}
              max={72}
              step={2}
              data-testid="slider-font-size"
            />
          </div>

          <div>
            <Label className="text-sm mb-2">الموضع</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger data-testid="select-position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">أعلى</SelectItem>
                <SelectItem value="center">منتصف</SelectItem>
                <SelectItem value="bottom">أسفل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Button variant="outline" className="w-full" size="sm">
              لون النص
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              لون الخلفية
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              إضافة ظل
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
