import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/ProjectCard";
import { UploadDialog } from "@/components/UploadDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, Search, Grid3x3, List, Film } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const projects = [
    {
      id: "1",
      title: "فيديو ترويجي للمنتج الجديد",
      duration: "2:45",
      updatedAt: "منذ ساعتين",
      status: "draft" as const,
    },
    {
      id: "2",
      title: "شرح تعليمي - الدرس الأول",
      duration: "5:30",
      updatedAt: "أمس",
      status: "completed" as const,
    },
    {
      id: "3",
      title: "مقابلة مع الخبراء",
      duration: "15:20",
      updatedAt: "منذ 3 أيام",
      status: "exporting" as const,
    },
  ];

  const handleOpenProject = (id: string) => {
    console.log("فتح المشروع:", id);
    setLocation("/editor");
  };

  const handleDeleteProject = (id: string) => {
    console.log("حذف المشروع:", id);
  };

  const handleDuplicateProject = (id: string) => {
    console.log("نسخ المشروع:", id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Film className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">محرر الفيديو الاحترافي</h1>
              <p className="text-xs text-muted-foreground">
                تعديل وترجمة الفيديوهات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">مشاريعي</h2>
            <p className="text-sm text-muted-foreground">
              {projects.length} مشروع
            </p>
          </div>

          <Button
            onClick={() => setUploadOpen(true)}
            size="lg"
            data-testid="button-new-project"
          >
            <Plus className="h-5 w-5 ml-2" />
            مشروع جديد
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في المشاريع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              data-testid="input-search-projects"
            />
          </div>

          <div className="flex gap-1 border rounded-md p-1">
            <Button
              size="icon"
              variant={viewMode === "grid" ? "default" : "ghost"}
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={viewMode === "list" ? "default" : "ghost"}
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted p-6 rounded-full inline-block mb-4">
              <Film className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              لا توجد مشاريع بعد
            </h3>
            <p className="text-muted-foreground mb-4">
              ابدأ بإنشاء مشروع جديد لتعديل الفيديوهات
            </p>
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء مشروع
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                onOpen={handleOpenProject}
                onDelete={handleDeleteProject}
                onDuplicate={handleDuplicateProject}
              />
            ))}
          </div>
        )}
      </main>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={(file, type) => {
          console.log("تم رفع الملف:", file, type);
          setLocation("/editor");
        }}
      />
    </div>
  );
}
