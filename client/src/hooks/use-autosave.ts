import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AutosaveOptions {
  onSave: () => Promise<void>;
  interval?: number;
  enabled?: boolean;
}

export function useAutosave({ onSave, interval = 30000, enabled = true }: AutosaveOptions) {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<Date>(new Date());

  const save = useCallback(async () => {
    try {
      await onSave();
      lastSaveRef.current = new Date();
      toast({
        title: "تم الحفظ التلقائي",
        description: "تم حفظ تغييراتك بنجاح",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "فشل الحفظ التلقائي",
        description: "حدث خطأ أثناء الحفظ التلقائي",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [onSave, toast]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      save();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, save]);

  const getLastSaveTime = useCallback(() => {
    return lastSaveRef.current;
  }, []);

  const manualSave = useCallback(async () => {
    await save();
  }, [save]);

  return {
    lastSaveTime: getLastSaveTime(),
    manualSave,
  };
}
