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
  onAddTextLayer?: (text: string) => void;
}

export function ToolPanel({ videoFilename, onVideoProcessed, onAddTextLayer }: ToolPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [transitions, setTransitions] = useState<string[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [filterIntensity, setFilterIntensity] = useState([1.0]);
  const [applying, setApplying] = useState(false);
  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [newTextContent, setNewTextContent] = useState("");
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState<string>("");
  const [transitionDuration, setTransitionDuration] = useState([1.0]);
  const [applyingTransition, setApplyingTransition] = useState(false);
  const [applyingText, setApplyingText] = useState(false);
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

  const handleAddText = async () => {
    if (!newTextContent.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نص",
        variant: "destructive",
      });
      return;
    }

    if (!videoFilename) {
      if (onAddTextLayer) {
        onAddTextLayer(newTextContent);
        toast({
          title: "تم إضافة النص",
          description: "تمت إضافة طبقة نص جديدة",
        });
        setNewTextContent("");
        setTextDialogOpen(false);
      }
      return;
    }

    setApplyingText(true);
    try {
      const outputFilename = `text_${Date.now()}.mp4`;
      const result = await VideoAPI.addTextOverlay(
        videoFilename,
        outputFilename,
        newTextContent,
        {
          position_x: 'center',
          position_y: 'center',
          fontsize: 50,
          color: 'white',
        }
      );

      if (result.success && result.output_file) {
        toast({
          title: "تم إضافة النص",
          description: "تمت إضافة النص للفيديو بنجاح",
        });
        setNewTextContent("");
        setTextDialogOpen(false);
        if (onVideoProcessed) {
          onVideoProcessed(result.output_file);
        }
      } else {
        throw new Error(result.error || "فشل إضافة النص");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ";
      toast({
        title: "فشل إضافة النص",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setApplyingText(false);
    }
  };

  const handleApplyTransition = async () => {
    if (!videoFilename || !selectedTransition) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد فيديو وانتقال",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تنبيه",
      description: "الانتقالات تتطلب فيديوهين. الرجاء استخدام Timeline لدمج مقاطع متعددة.",
      variant: "destructive",
    });
    setTransitionDialogOpen(false);
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

  const filterCategories: Record<string, string[]> = {
    "تحسينات": ["brightness", "contrast", "saturation", "sharpen"],
    "تأثيرات فنية": ["grayscale", "sepia", "invert", "blur"],
  };

  const filterDescriptions: Record<string, string> = {
    brightness: "يزيد أو يقلل سطوع الفيديو",
    contrast: "يحسّن التباين بين المناطق الفاتحة والداكنة",
    saturation: "يتحكم في كثافة الألوان",
    blur: "يضيف تمويه ناعم للفيديو",
    sharpen: "يزيد حدة ووضوح التفاصيل",
    grayscale: "يحوّل الفيديو إلى أبيض وأسود",
    sepia: "يضيف تأثير كلاسيكي بني داكن",
    invert: "يعكس ألوان الفيديو",
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
              onClick={() => setTextDialogOpen(true)}
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
              {Object.entries(filterCategories).map(([category, categoryFilters]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold mb-3 text-primary">{category}</h4>
                  <div className="space-y-2">
                    {categoryFilters.filter(f => filters && filters.includes(f)).map((filter) => (
                      <div
                        key={filter}
                        className="p-3 border rounded-lg hover-elevate cursor-pointer transition-all bg-card hover:bg-accent/50"
                        onClick={() => {
                          setSelectedFilter(filter);
                          setFilterDialogOpen(true);
                        }}
                        data-testid={`filter-${filter}`}
                      >
                        <p className="text-sm font-semibold mb-1">
                          {filterNameMap[filter] || filter}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {filterDescriptions[filter] || "فلتر"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filters && filters.filter(f => f && !Object.values(filterCategories).flat().includes(f)).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">أخرى</h4>
                  <div className="space-y-2">
                    {filters.filter(f => f && !Object.values(filterCategories).flat().includes(f)).map((filter) => (
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
              )}
              
              <div>
                <h4 className="text-sm font-semibold mb-2">الانتقالات</h4>
                <div className="space-y-2">
                  {transitions && transitions.map((transition) => (
                    <div
                      key={transition}
                      className="p-3 border rounded-md hover-elevate cursor-pointer transition-all"
                      onClick={() => {
                        setSelectedTransition(transition);
                        setTransitionDialogOpen(true);
                      }}
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
          <ScrollArea className="h-full -mx-4 px-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-primary">موسيقى خلفية</h4>
                <div className="space-y-2">
                  {[
                    { id: 1, name: "حماسية 1", duration: "2:30", category: "حماسية" },
                    { id: 2, name: "هادئة 1", duration: "3:15", category: "هادئة" },
                    { id: 3, name: "سعيدة 1", duration: "1:45", category: "سعيدة" },
                    { id: 4, name: "حزينة 1", duration: "2:50", category: "حزينة" },
                  ].map((track) => (
                    <div
                      key={track.id}
                      className="p-3 border rounded-lg hover-elevate cursor-pointer transition-all bg-card hover:bg-accent/50 group"
                      data-testid={`audio-track-${track.id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Music className="h-4 w-4 text-green-500" />
                          {track.name}
                        </p>
                        <span className="text-xs font-mono text-muted-foreground">
                          {track.duration}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {track.category}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-primary">مؤثرات صوتية</h4>
                <div className="space-y-2">
                  {[
                    { id: 5, name: "تصفيق", duration: "0:03", category: "مؤثر" },
                    { id: 6, name: "جرس", duration: "0:02", category: "مؤثر" },
                    { id: 7, name: "ضحك", duration: "0:05", category: "مؤثر" },
                  ].map((sound) => (
                    <div
                      key={sound.id}
                      className="p-3 border rounded-lg hover-elevate cursor-pointer transition-all bg-card hover:bg-accent/50"
                      data-testid={`sound-effect-${sound.id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Music className="h-4 w-4 text-blue-500" />
                          {sound.name}
                        </p>
                        <span className="text-xs font-mono text-muted-foreground">
                          {sound.duration}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {sound.category}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="stickers" className="flex-1 m-0 p-4">
          <ScrollArea className="h-full -mx-4 px-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-primary">ملصقات الوجوه التعبيرية</h4>
                <div className="grid grid-cols-3 gap-2">
                  {["😊", "😂", "😍", "🤔", "👍", "❤️", "🎉", "🔥", "⭐"].map((emoji, i) => (
                    <div
                      key={i}
                      className="aspect-square p-3 border rounded-lg hover-elevate cursor-pointer transition-all bg-card hover:bg-accent/50 flex items-center justify-center text-3xl"
                      data-testid={`emoji-${i}`}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-primary">أشكال وأيقونات</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: "⬆️", name: "سهم" },
                    { icon: "✓", name: "صح" },
                    { icon: "✗", name: "خطأ" },
                    { icon: "●", name: "دائرة" },
                    { icon: "■", name: "مربع" },
                    { icon: "▶", name: "تشغيل" },
                  ].map((shape, i) => (
                    <div
                      key={i}
                      className="aspect-square p-3 border rounded-lg hover-elevate cursor-pointer transition-all bg-card hover:bg-accent/50 flex flex-col items-center justify-center gap-1"
                      data-testid={`shape-${i}`}
                    >
                      <span className="text-2xl">{shape.icon}</span>
                      <span className="text-xs text-muted-foreground">{shape.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-primary">رموز وأيقونات</h4>
                <div className="grid grid-cols-3 gap-2">
                  {["📱", "💻", "🎵", "📷", "🎬", "📝"].map((icon, i) => (
                    <div
                      key={i}
                      className="aspect-square p-3 border rounded-lg hover-elevate cursor-pointer transition-all bg-card hover:bg-accent/50 flex items-center justify-center text-3xl"
                      data-testid={`icon-${i}`}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
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

      <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة طبقة نص</DialogTitle>
            <DialogDescription>
              أدخل النص الذي تريد إضافته إلى الفيديو
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4" dir="rtl">
            <div className="space-y-2">
              <Label>النص</Label>
              <Input
                value={newTextContent}
                onChange={(e) => setNewTextContent(e.target.value)}
                placeholder="أدخل النص هنا..."
                className="text-right"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTextDialogOpen(false);
                setNewTextContent("");
              }}
            >
              إلغاء
            </Button>
            <Button onClick={handleAddText} disabled={applyingText}>
              {applyingText ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transitionDialogOpen} onOpenChange={setTransitionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تطبيق انتقال {transitionNameMap[selectedTransition] || selectedTransition}</DialogTitle>
            <DialogDescription>
              الانتقالات تعمل بين مقطعين فيديو. استخدم Timeline لدمج المقاطع أولاً.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>مدة الانتقال (بالثواني)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={transitionDuration}
                  onValueChange={setTransitionDuration}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="flex-1"
                  disabled={applyingTransition}
                />
                <span className="text-sm font-mono w-12 text-right">
                  {transitionDuration[0].toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransitionDialogOpen(false)}
              disabled={applyingTransition}
            >
              إلغاء
            </Button>
            <Button onClick={handleApplyTransition} disabled={applyingTransition || !videoFilename}>
              {applyingTransition ? "جاري التطبيق..." : "تطبيق"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
