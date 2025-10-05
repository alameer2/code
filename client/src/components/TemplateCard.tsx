import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock } from "lucide-react";

interface TemplateCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail?: string;
  onSelect: (id: string) => void;
}

export function TemplateCard({
  id,
  title,
  description,
  duration,
  category,
  thumbnail,
  onSelect,
}: TemplateCardProps) {
  return (
    <Card 
      className="group overflow-hidden hover-elevate transition-all cursor-pointer"
      onClick={() => onSelect(id)}
      data-testid={`template-${id}`}
    >
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 relative overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-12 w-12 text-primary opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button size="sm" variant="secondary">
            استخدام القالب
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
            {category}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {duration}
          </div>
        </div>
      </div>
    </Card>
  );
}
