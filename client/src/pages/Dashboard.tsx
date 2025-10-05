import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/ProjectCard";
import { TemplateCard } from "@/components/TemplateCard";
import { UploadDialog } from "@/components/UploadDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, Search, Grid3x3, List, Film, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "تم حذف المشروع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في حذف المشروع",
        variant: "destructive",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const project = projects.find((p) => p.id === id);
      if (!project) throw new Error("المشروع غير موجود");
      
      await apiRequest("POST", "/api/projects", {
        title: `${project.title} (نسخة)`,
        description: project.description,
        duration: project.duration,
        status: "draft",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "تم نسخ المشروع بنجاح",
      });
    },
  });

  const handleOpenProject = (id: string) => {
    setLocation(`/editor?id=${id}`);
  };

  const handleDeleteProject = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleDuplicateProject = (id: string) => {
    duplicateMutation.mutate(id);
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRelativeTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ar 
    });
  };

  const templates = [
    {
      id: "1",
      title: "فيديو ترويجي",
      description: "قالب احترافي للفيديوهات الترويجية والإعلانات",
      duration: "0:30",
      category: "تسويق",
    },
    {
      id: "2",
      title: "عرض تقديمي",
      description: "قالب مثالي للعروض التقديمية والشروحات",
      duration: "1:00",
      category: "تعليمي",
    },
    {
      id: "3",
      title: "وسائل تواصل اجتماعي",
      description: "قالب مصمم خصيصاً لمنصات التواصل الاجتماعي",
      duration: "0:15",
      category: "سوشيال ميديا",
    },
    {
      id: "4",
      title: "قصة إنستغرام",
      description: "قالب عمودي مناسب لقصص إنستغرام",
      duration: "0:15",
      category: "سوشيال ميديا",
    },
    {
      id: "5",
      title: "فيديو تعليمي",
      description: "قالب شامل للدروس التعليمية والشروحات",
      duration: "2:00",
      category: "تعليمي",
    },
    {
      id: "6",
      title: "إعلان منتج",
      description: "قالب احترافي لعرض المنتجات",
      duration: "0:45",
      category: "تسويق",
    },
  ];

  const handleSelectTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      toast({
        title: `تم اختيار قالب: ${template.title}`,
        description: `الفئة: ${template.category} • المدة: ${template.duration}`,
      });
    }
    setUploadOpen(true);
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
        <Tabs defaultValue="projects" className="w-full" dir="rtl">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="projects" className="gap-2">
                <Film className="h-4 w-4" />
                مشاريعي
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <Sparkles className="h-4 w-4" />
                القوالب الجاهزة
              </TabsTrigger>
            </TabsList>

            <Button
              onClick={() => setUploadOpen(true)}
              size="lg"
              data-testid="button-new-project"
            >
              <Plus className="h-5 w-5 ml-2" />
              مشروع جديد
            </Button>
          </div>

          <TabsContent value="projects" className="space-y-6 mt-0">

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

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">جاري تحميل المشاريع...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted p-6 rounded-full inline-block mb-4">
              <Film className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {projects.length === 0 ? "لا توجد مشاريع بعد" : "لا توجد نتائج"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {projects.length === 0 
                ? "ابدأ بإنشاء مشروع جديد لتعديل الفيديوهات"
                : "جرب مصطلح بحث آخر"
              }
            </p>
            {projects.length === 0 && (
              <Button onClick={() => setUploadOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إنشاء مشروع
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                duration={project.duration ?? "0:00"}
                updatedAt={getRelativeTime(project.updatedAt)}
                status={project.status as "draft" | "completed" | "exporting"}
                onOpen={handleOpenProject}
                onDelete={handleDeleteProject}
                onDuplicate={handleDuplicateProject}
              />
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 mt-0">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">اختر قالباً للبدء</h3>
              <p className="text-sm text-muted-foreground">
                قوالب احترافية جاهزة للاستخدام توفر عليك الوقت والجهد
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  id={template.id}
                  title={template.title}
                  description={template.description}
                  duration={template.duration}
                  category={template.category}
                  onSelect={handleSelectTemplate}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
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
