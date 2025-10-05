import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Layer {
  id: string;
  name: string;
  type: 'video' | 'text' | 'image' | 'sticker';
  visible: boolean;
  locked: boolean;
  order: number;
  thumbnail?: string;
}

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (id: string) => void;
  onLayerUpdate: (layers: Layer[]) => void;
  onLayerDelete: (id: string) => void;
}

export default function LayerPanel({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerUpdate,
  onLayerDelete,
}: LayerPanelProps) {
  const { toast } = useToast();

  const toggleVisibility = (id: string) => {
    const updated = layers.map((layer) =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    );
    onLayerUpdate(updated);
  };

  const toggleLock = (id: string) => {
    const updated = layers.map((layer) =>
      layer.id === id ? { ...layer, locked: !layer.locked } : layer
    );
    onLayerUpdate(updated);
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex((l) => l.id === id);
    if (index === -1) return;

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === layers.length - 1) return;

    const newLayers = [...layers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newLayers[index], newLayers[targetIndex]] = [newLayers[targetIndex], newLayers[index]];

    const reordered = newLayers.map((layer, i) => ({ ...layer, order: i }));
    onLayerUpdate(reordered);
  };

  const handleDelete = (id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (layer?.locked) {
      toast({
        title: 'الطبقة مقفلة',
        description: 'يجب فك القفل قبل الحذف',
        variant: 'destructive',
      });
      return;
    }
    onLayerDelete(id);
  };

  const sortedLayers = [...layers].sort((a, b) => a.order - b.order);

  return (
    <Card className="p-4 h-full" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">الطبقات</h3>
      </div>
      
      <div className="space-y-2">
        {sortedLayers.map((layer, index) => (
          <div
            key={layer.id}
            onClick={() => !layer.locked && onLayerSelect(layer.id)}
            className={`
              flex items-center gap-2 p-2 rounded border cursor-pointer
              ${selectedLayerId === layer.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
              ${layer.locked ? 'opacity-60' : ''}
            `}
          >
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayer(layer.id, 'up');
                }}
                disabled={index === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayer(layer.id, 'down');
                }}
                disabled={index === sortedLayers.length - 1}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>

            {layer.thumbnail && (
              <img
                src={layer.thumbnail}
                alt={layer.name}
                className="w-10 h-10 object-cover rounded"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{layer.name}</div>
              <div className="text-xs text-gray-500">{layer.type}</div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(layer.id);
                }}
              >
                {layer.visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(layer.id);
                }}
              >
                {layer.locked ? (
                  <Lock className="h-4 w-4 text-red-500" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(layer.id);
                }}
                disabled={layer.locked}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {sortedLayers.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            لا توجد طبقات
          </div>
        )}
      </div>
    </Card>
  );
}
