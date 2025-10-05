import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Scissors, Copy, Trash2, Plus, Video, Music, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimelineClip {
  id: string;
  type: "video" | "audio" | "subtitle" | "text";
  start: number;
  duration: number;
  label: string;
  color: string;
}

export function Timeline() {
  const [zoom, setZoom] = useState([50]);
  const [clips, setClips] = useState<TimelineClip[]>([
    {
      id: "1",
      type: "video",
      start: 0,
      duration: 30,
      label: "مقطع الافتتاحية",
      color: "bg-blue-500",
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

  const tracks = [
    { type: "video", label: "فيديو", icon: Video },
    { type: "audio", label: "صوت", icon: Music },
    { type: "subtitle", label: "ترجمات", icon: Type },
  ];

  const handleDeleteClip = (id: string) => {
    setClips(clips.filter((c) => c.id !== id));
    console.log("حذف المقطع:", id);
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
      console.log("نسخ المقطع:", id);
    }
  };

  return (
    <div className="bg-card border-t border-border h-64 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" data-testid="button-cut">
            <Scissors className="h-4 w-4 ml-1" />
            قص
          </Button>
          <Button size="sm" variant="outline" data-testid="button-copy">
            <Copy className="h-4 w-4 ml-1" />
            نسخ
          </Button>
          <Button size="sm" variant="outline" data-testid="button-delete">
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
    </div>
  );
}
