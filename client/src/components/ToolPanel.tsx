import { useState, useEffect } from "react";
import {
  Folder,
  Type,
  Sparkles,
  Music,
  Sticker,
  Video,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { VideoAPI } from "@/lib/videoApi";
import { useToast } from "@/hooks/use-toast";

interface ToolPanelProps {
  videoFilename?: string;
  onVideoProcessed?: (filename: string) => void;
}

export function ToolPanel({ videoFilename, onVideoProcessed }: ToolPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [transitions, setTransitions] = useState<string[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [filterIntensity, setFilterIntensity] = useState([1.0]);
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadEffects = async () => {
      try {
        const [filtersList, transitionsList] = await Promise.all([
          VideoAPI.getAvailableFilters(),
          VideoAPI.getAvailableTransitions(),
        ]);
        setFilters(filtersList);
        setTransitions(transitionsList);
      } catch (err) {
        console.error("Failed to load effects:", err);
        toast({
          title: "تنبيه",
          description: "فشل تحميل قوائم التأثيرات والفلاتر",
          variant: "destructive",
        });
      }
    };
    loadEffects();
  }, [toast]);

  const tabs = [
    { value: "media", label: "وسائط", icon: Folder },
    { value: "text", label: "نصوص", icon: Type },
    { value: "effects", label: "تأثيرات", icon: Sparkles },
    { value: "audio", label: "صوت", icon: Music },
    { value: "stickers", label: "ملصقات", icon: Sticker },
  ];

  const mediaItems = [
    { id: "1", type: "video", name: "video1.mp4", duration: "2:30" },
    { id: "2", type: "video", name: "video2.mp4", duration: "1:45" },
    { id: "3", type: "audio", name: "music.mp3", duration: "3:15" },
  ];

  const handleApplyFilter = async () => {
    if (!videoFilename || !selectedFilter) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد فيديو وفلتر",
        variant: "destructive",
      });
      return;
    }

    setApplying(true);
    try {
      const outputFilename = `filtered_${selectedFilter}_${Date.now()}.mp4`;
      const result = await VideoAPI.applyFilter(
        videoFilename,
        outputFilename,
        selectedFilter,
        filterIntensity[0]
      );

      if (result.success && result.output_file) {
        toast({
          title: "نجح تطبيق الفلتر",
          description: `تم تطبيق فلتر ${selectedFilter}`,
        });
        setFilterDialogOpen(false);
        if (onVideoProcessed) {
          onVideoProcessed(result.output_file);
        }
      } else {
        throw new Error(result.error || "فشل تطبيق الفلتر");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ";
      toast({
        title: "فشل تطبيق الفلتر",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const filterNameMap: Record<string, string> = {
    brightness: "السطوع",
    contrast: "التباين",
    saturation: "التشبع",
    blur: "التمويه",
    sharpen: "الحدة",
    grayscale: "أبيض وأسود",
    sepia: "بني داكن",
    invert: "عكس الألوان",
  };

  const transitionNameMap: Record<string, string> = {
    fade: "تلاشي",
    dissolve: "ذوبان",
    wipe: "مسح",
    slide: "انزلاق",
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border w-72">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold mb-3">أدوات التحرير</h3>
        <Input
          placeholder="بحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-tools"
        />
      </div>

      <Tabs defaultValue="media" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-5 mx-4 mt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex flex-col gap-1 h-auto py-2"
                data-testid={`tab-${tab.value}`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="media" className="flex-1 m-0 p-4">
          <ScrollArea className="h-full -mx-4 px-4">
            <div className="space-y-2">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border rounded-md hover-elevate cursor-pointer transition-all"
                  data-testid={`media-item-${item.id}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.type === "video" ? (
                      <Video className="h-4 w-4 text-primary" />
                    ) : (
                      <Music className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm font-medium truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {item.duration}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="text" className="flex-1 m-0 p-4">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              data-testid="button-add-title"
            >
              <Type className="h-4 w-4 ml-2" />
              إضافة عنوان
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              data-testid="button-add-subtitle"
            >
              <FileText className="h-4 w-4 ml-2" />
              إضافة ترجمة
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="effects" className="flex-1 m-0 p-4">
          <ScrollArea className="h-full -mx-4 px-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">الفلاتر</h4>
                <div className="space-y-2">
                  {filters.map((filter) => (
                    <div
                      key={filter}
                      className="p-3 border rounded-md hover-elevate cursor-pointer transition-all"
                      onClick={() => {
                        setSelectedFilter(filter);
                        setFilterDialogOpen(true);
                      }}
                      data-testid={`filter-${filter}`}
                    >
                      <p className="text-sm font-medium">
                        {filterNameMap[filter] || filter}
                      </p>
                      <span className="text-xs text-muted-foreground">فلتر</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">الانتقالات</h4>
                <div className="space-y-2">
                  {transitions.map((transition) => (
                    <div
                      key={transition}
                      className="p-3 border rounded-md hover-elevate cursor-pointer transition-all"
                      data-testid={`transition-${transition}`}
                    >
                      <p className="text-sm font-medium">
                        {transitionNameMap[transition] || transition}
                      </p>
                      <span className="text-xs text-muted-foreground">انتقال</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="audio" className="flex-1 m-0 p-4">
          <div className="text-center text-muted-foreground py-8">
            <Music className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">مكتبة الموسيقى</p>
          </div>
        </TabsContent>

        <TabsContent value="stickers" className="flex-1 m-0 p-4">
          <div className="text-center text-muted-foreground py-8">
            <Sticker className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">مكتبة الملصقات</p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تطبيق فلتر {filterNameMap[selectedFilter] || selectedFilter}</DialogTitle>
            <DialogDescription>
              اضبط شدة الفلتر للحصول على التأثير المطلوب
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الشدة</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={filterIntensity}
                  onValueChange={setFilterIntensity}
                  min={0}
                  max={2}
                  step={0.1}
                  className="flex-1"
                  disabled={applying}
                />
                <span className="text-sm font-mono w-12 text-right">
                  {filterIntensity[0].toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFilterDialogOpen(false)}
              disabled={applying}
            >
              إلغاء
            </Button>
            <Button onClick={handleApplyFilter} disabled={applying || !videoFilename}>
              {applying ? "جاري التطبيق..." : "تطبيق"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
