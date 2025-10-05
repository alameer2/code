import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

export function PropertiesPanel() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState([100]);
  const [rotation, setRotation] = useState([0]);
  const [opacity, setOpacity] = useState([100]);

  return (
    <div className="flex flex-col h-full bg-card border-l border-border w-80">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">خصائص العنصر</h3>
        <p className="text-xs text-muted-foreground mt-1">
          مقطع الافتتاحية
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["transform", "effects"]} className="w-full">
            <AccordionItem value="transform">
              <AccordionTrigger>التحويل والموضع</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1">الموضع X</Label>
                    <Input
                      type="number"
                      value={position.x}
                      onChange={(e) =>
                        setPosition({ ...position, x: Number(e.target.value) })
                      }
                      className="h-8"
                      data-testid="input-position-x"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1">الموضع Y</Label>
                    <Input
                      type="number"
                      value={position.y}
                      onChange={(e) =>
                        setPosition({ ...position, y: Number(e.target.value) })
                      }
                      className="h-8"
                      data-testid="input-position-y"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2">الحجم: {scale[0]}%</Label>
                  <Slider
                    value={scale}
                    onValueChange={setScale}
                    min={10}
                    max={200}
                    step={5}
                    data-testid="slider-scale"
                  />
                </div>

                <div>
                  <Label className="text-xs mb-2">الدوران: {rotation[0]}°</Label>
                  <Slider
                    value={rotation}
                    onValueChange={setRotation}
                    min={-180}
                    max={180}
                    step={1}
                    data-testid="slider-rotation"
                  />
                </div>

                <div>
                  <Label className="text-xs mb-2">الشفافية: {opacity[0]}%</Label>
                  <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    min={0}
                    max={100}
                    step={5}
                    data-testid="slider-opacity"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="effects">
              <AccordionTrigger>التأثيرات</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs mb-2">الفلتر</Label>
                  <Select defaultValue="none">
                    <SelectTrigger className="h-8" data-testid="select-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون</SelectItem>
                      <SelectItem value="blur">ضبابي</SelectItem>
                      <SelectItem value="grayscale">أبيض وأسود</SelectItem>
                      <SelectItem value="sepia">سيبيا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs mb-2">الانتقال</Label>
                  <Select defaultValue="none">
                    <SelectTrigger className="h-8" data-testid="select-transition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون</SelectItem>
                      <SelectItem value="fade">تلاشي</SelectItem>
                      <SelectItem value="slide">انزلاق</SelectItem>
                      <SelectItem value="zoom">تكبير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  إضافة تأثير مخصص
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="timing">
              <AccordionTrigger>التوقيت</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs mb-1">وقت البداية</Label>
                  <Input
                    type="text"
                    defaultValue="00:00:00.000"
                    className="h-8 font-mono text-xs"
                    data-testid="input-start-time-properties"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1">المدة</Label>
                  <Input
                    type="text"
                    defaultValue="00:00:05.000"
                    className="h-8 font-mono text-xs"
                    data-testid="input-duration"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-2">
        <Button variant="default" size="sm" className="w-full">
          تطبيق التغييرات
        </Button>
        <Button variant="outline" size="sm" className="w-full">
          إعادة تعيين
        </Button>
      </div>
    </div>
  );
}
