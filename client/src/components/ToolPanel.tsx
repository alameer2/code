import { useState } from "react";
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

export function ToolPanel() {
  const [searchQuery, setSearchQuery] = useState("");

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

  const effects = [
    { id: "1", name: "Fade In", category: "انتقال" },
    { id: "2", name: "Fade Out", category: "انتقال" },
    { id: "3", name: "Blur", category: "فلتر" },
    { id: "4", name: "Grayscale", category: "فلتر" },
  ];

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
            <div className="space-y-2">
              {effects.map((effect) => (
                <div
                  key={effect.id}
                  className="p-3 border rounded-md hover-elevate cursor-pointer transition-all"
                  draggable
                  data-testid={`effect-${effect.id}`}
                >
                  <p className="text-sm font-medium">{effect.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {effect.category}
                  </span>
                </div>
              ))}
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
    </div>
  );
}
