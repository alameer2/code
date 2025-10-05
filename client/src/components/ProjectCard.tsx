import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Play, Clock, FileVideo } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ProjectCardProps {
  id: string;
  title: string;
  thumbnail?: string;
  duration: string;
  updatedAt: string;
  status: "draft" | "completed" | "exporting";
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  thumbnail,
  duration,
  updatedAt,
  status,
  onOpen,
  onDelete,
  onDuplicate,
}: ProjectCardProps) {
  const statusConfig = {
    draft: { label: "مسودة", variant: "secondary" as const },
    completed: { label: "مكتمل", variant: "default" as const },
    exporting: { label: "جاري التصدير", variant: "outline" as const },
  };

  return (
    <Card
      className="group overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer"
      data-testid={`card-project-${id}`}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileVideo className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="icon"
            variant="default"
            className="h-12 w-12 rounded-full"
            onClick={() => onOpen(id)}
            data-testid={`button-open-${id}`}
          >
            <Play className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant={statusConfig[status].variant} className="text-xs">
            {statusConfig[status].label}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base truncate"
              data-testid={`text-title-${id}`}
            >
              {title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {duration}
              </span>
              <span>{updatedAt}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-testid={`button-menu-${id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen(id)}>
                فتح المشروع
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(id)}>
                نسخ المشروع
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(id)}
                className="text-destructive"
              >
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
