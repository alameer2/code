import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Timeline } from "@/components/Timeline";
import { SubtitleEditor } from "@/components/SubtitleEditor";
import { ToolPanel } from "@/components/ToolPanel";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import LayerPanel, { Layer } from "@/components/LayerPanel";
import { ExportDialog } from "@/components/ExportDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAutosave } from "@/hooks/use-autosave";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Save,
  Download,
  Undo,
  Redo,
  Settings,
  Film,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import type { Project, File as ProjectFile } from "@shared/schema";

export default function Editor() {
  const [location, setLocation] = useLocation();
  const [exportOpen, setExportOpen] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showTools, setShowTools] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  const handleSave = async () => {
    if (!projectId || !project) return;
    
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          duration: project.duration,
          updatedAt: new Date().toISOString(),
        }),
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('فشل الحفظ:', error);
      throw error;
    }
  };

  const { lastSaveTime, manualSave } = useAutosave({
    onSave: handleSave,
    interval: 30000,
    enabled: hasUnsavedChanges && !!projectId,
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!projectId,
  });

  const { data: files = [], isLoading: filesLoading } = useQuery<ProjectFile[]>({
    queryKey: ["/api/projects", projectId, "files"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/files`);
      if (!res.ok) throw new Error("Failed to fetch files");
      return res.json();
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    if (!projectId) {
      setLocation("/");
    }
  }, [projectId, setLocation]);

  useEffect(() => {
    if (files.length > 0) {
      const newLayers: Layer[] = files.map((file, index) => ({
        id: `layer_${file.id}`,
        name: file.filename || `طبقة ${index + 1}`,
        type: file.type as 'video' | 'text' | 'image' | 'sticker',
        visible: true,
        locked: false,
        order: index,
        thumbnail: file.url,
      }));
      
      setLayers(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const toAdd = newLayers.filter(l => !existingIds.has(l.id));
        return [...prev, ...toAdd];
      });
    }
  }, [files]);

  if (!projectId) {
    return null;
  }

  if (projectLoading || filesLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المشروع...</p>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full inline-block mb-4">
            <Film className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">المشروع غير موجود</h2>
          <p className="text-muted-foreground mb-4">
            لم نتمكن من العثور على المشروع المطلوب
          </p>
          <Button onClick={() => setLocation("/")}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded">
            <Film className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">
              {project?.title || "جاري التحميل..."}
            </h1>
            <p className="text-xs text-muted-foreground">
              {files.length > 0 ? `${files.length} ملف` : "بدون ملفات"}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            data-testid="button-undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            data-testid="button-redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          {hasUnsavedChanges ? (
            <Badge variant="secondary" className="mr-2">
              غير محفوظ
            </Badge>
          ) : (
            <Badge variant="outline" className="mr-2 text-green-600 border-green-600">
              محفوظ ✓
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={manualSave}
            disabled={!hasUnsavedChanges}
            data-testid="button-save"
          >
            <Save className="h-4 w-4 ml-2" />
            حفظ
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setExportOpen(true)}
            data-testid="button-export"
          >
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowTools(!showTools)}>
                {showTools ? "إخفاء" : "إظهار"} الأدوات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLayers(!showLayers)}>
                {showLayers ? "إخفاء" : "إظهار"} الطبقات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowProperties(!showProperties)}>
                {showProperties ? "إخفاء" : "إظهار"} الخصائص
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSubtitles(!showSubtitles)}>
                {showSubtitles ? "إخفاء" : "إظهار"} محرر الترجمات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>إعدادات المشروع</DropdownMenuItem>
              <DropdownMenuItem>اختصارات لوحة المفاتيح</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {showTools && (
          <ToolPanel 
            videoFilename={files.find(f => f.type === 'video')?.url?.split('/').pop()}
            onAddTextLayer={(text) => {
              const newLayer: Layer = {
                id: `layer_text_${Date.now()}`,
                name: text.substring(0, 20) + (text.length > 20 ? '...' : ''),
                type: 'text',
                visible: true,
                locked: false,
                order: layers.length,
              };
              setLayers([...layers, newLayer]);
              setSelectedLayerId(newLayer.id);
              setHasUnsavedChanges(true);
            }}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {showSubtitles && (
              <div className="w-96 flex-shrink-0">
                <SubtitleEditor 
                  videoFilename={files.find(f => f.type === 'video')?.url?.split('/').pop()}
                />
              </div>
            )}

            <div className="flex-1 p-6 flex items-center justify-center bg-muted/20 overflow-auto">
              <div className="w-full max-w-4xl">
                <VideoPlayer src={files.find(f => f.type === "video")?.url} />
              </div>
            </div>
          </div>

          <Timeline videoFilename={files.find(f => f.type === 'video')?.url?.split('/').pop()} />
        </div>

        {showLayers && (
          <div className="w-72 flex-shrink-0 border-l border-border">
            <LayerPanel
              layers={layers}
              selectedLayerId={selectedLayerId}
              onLayerSelect={setSelectedLayerId}
              onLayerUpdate={setLayers}
              onLayerDelete={(id) => setLayers(layers.filter(l => l.id !== id))}
            />
          </div>
        )}

        {showProperties && <PropertiesPanel />}
      </div>

      <ExportDialog 
        open={exportOpen} 
        onOpenChange={setExportOpen}
        videoFilename={files.find(f => f.type === 'video')?.url?.split('/').pop()}
      />
    </div>
  );
}
