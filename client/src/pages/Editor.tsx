import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Timeline } from "@/components/Timeline";
import { SubtitleEditor } from "@/components/SubtitleEditor";
import { ToolPanel } from "@/components/ToolPanel";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { ExportDialog } from "@/components/ExportDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
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

export default function Editor() {
  const [, setLocation] = useLocation();
  const [exportOpen, setExportOpen] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showTools, setShowTools] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

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
              فيديو ترويجي للمنتج الجديد
            </h1>
            <p className="text-xs text-muted-foreground">تم الحفظ تلقائياً</p>
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
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
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
        {showTools && <ToolPanel />}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {showSubtitles && (
              <div className="w-96 flex-shrink-0">
                <SubtitleEditor />
              </div>
            )}

            <div className="flex-1 p-6 flex items-center justify-center bg-muted/20 overflow-auto">
              <div className="w-full max-w-4xl">
                <VideoPlayer />
              </div>
            </div>
          </div>

          <Timeline />
        </div>

        {showProperties && <PropertiesPanel />}
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}
