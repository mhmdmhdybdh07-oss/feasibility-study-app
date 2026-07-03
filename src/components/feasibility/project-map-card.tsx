'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { MapPin, Navigation, Search, Loader2, Crosshair } from 'lucide-react';

// إحداثيات محافظات اليمن
const YEMEN_REGIONS: Record<string, { lat: number; lng: number; name: string }> = {
  'صنعاء': { lat: 15.3694, lng: 44.1910, name: 'صنعاء' },
  'ذمار': { lat: 14.5417, lng: 44.4057, name: 'ذمار' },
  'إب': { lat: 13.9667, lng: 44.1833, name: 'إب' },
  'تعز': { lat: 13.5795, lng: 44.0209, name: 'تعز' },
  'الحديدة': { lat: 14.7978, lng: 42.9545, name: 'الحديدة' },
  'حضرموت': { lat: 15.9333, lng: 48.5167, name: 'حضرموت' },
  'المكلا': { lat: 14.5333, lng: 49.1333, name: 'المكلا' },
  'عمران': { lat: 15.6953, lng: 43.7565, name: 'عمران' },
  'صعدة': { lat: 16.9402, lng: 43.7639, name: 'صعدة' },
  'حجة': { lat: 15.6953, lng: 43.4050, name: 'حجة' },
  'مأرب': { lat: 15.4625, lng: 45.3247, name: 'مأرب' },
  'شبوة': { lat: 14.5358, lng: 46.8250, name: 'شبوة' },
  'المهرة': { lat: 16.6500, lng: 51.9167, name: 'المهرة' },
  'أبين': { lat: 13.5000, lng: 45.5000, name: 'أبين' },
  'البيضاء': { lat: 14.2833, lng: 45.3333, name: 'البيضاء' },
  'لحج': { lat: 13.0500, lng: 44.6333, name: 'لحج' },
  'الجوف': { lat: 16.5000, lng: 45.5000, name: 'الجوف' },
  'سقطرى': { lat: 12.5000, lng: 53.9333, name: 'سقطرى' },
};

export function ProjectMapCard() {
  const { locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const { data: project } = useProject(currentProjectId);
  const updateProject = useUpdateProject();

  const est = (project?.establishment as any) ?? {};
  const [searchRegion, setSearchRegion] = useState('');

  // استخراج الموقع من بيانات المشروع
  const projectLocation = est.projectLocation || '';
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // محاولة مطابقة الموقع مع المناطق المعروفة
  let matchedRegion: { name: string; lat: number; lng: number } | null = null;
  if (projectLocation) {
    for (const [name, coords] of Object.entries(YEMEN_REGIONS)) {
      if (projectLocation.includes(name)) {
        matchedRegion = { name, ...coords };
        break;
      }
    }
  }

  const displayLat = lat ?? matchedRegion?.lat ?? 15.3694;
  const displayLng = lng ?? matchedRegion?.lng ?? 44.1910;

  // OpenStreetMap embed URL (مجاني بدون API key)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${displayLng - 0.05}%2C${displayLat - 0.05}%2C${displayLng + 0.05}%2C${displayLat + 0.05}&layer=mapnik&marker=${displayLat}%2C${displayLng}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${displayLat}&mlon=${displayLng}#map=14/${displayLat}/${displayLng}`;

  const handleSetLocation = (regionName: string) => {
    const region = YEMEN_REGIONS[regionName];
    if (region) {
      setLat(region.lat);
      setLng(region.lng);
    }
  };

  if (!project) return null;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="size-10 rounded-md bg-cyan-500/10 flex items-center justify-center shrink-0">
          <MapPin className="size-5 text-cyan-600" />
        </div>
        <div>
          <h3 className="text-md font-semibold">{locale === 'ar' ? 'موقع المشروع على الخريطة' : 'Project Location Map'}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{projectLocation || (locale === 'ar' ? 'لم يتم تحديد الموقع' : 'No location set')}</p>
        </div>
      </div>

      {/* الخريطة */}
      <div className="rounded-lg overflow-hidden border mb-3" style={{ height: 300 }}>
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          title="Project Location"
        />
      </div>

      {/* الإحداثيات */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="p-2 rounded bg-secondary/30 text-center">
          <span className="text-muted-foreground">{locale === 'ar' ? 'خط العرض' : 'Latitude'}: </span>
          <span className="font-mono font-bold">{displayLat.toFixed(4)}°</span>
        </div>
        <div className="p-2 rounded bg-secondary/30 text-center">
          <span className="text-muted-foreground">{locale === 'ar' ? 'خط الطول' : 'Longitude'}: </span>
          <span className="font-mono font-bold">{displayLng.toFixed(4)}°</span>
        </div>
      </div>

      {/* اختيار منطقة */}
      <div className="space-y-2">
        <Label className="text-xs">{locale === 'ar' ? 'اختر محافظة لتحديد الموقع:' : 'Select governorate:'}</Label>
        <div className="flex flex-wrap gap-1">
          {Object.entries(YEMEN_REGIONS).map(([name, coords]) => (
            <button
              key={name}
              onClick={() => handleSetLocation(name)}
              className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
                matchedRegion?.name === name
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-accent border-border'
              }`}
            >
              <MapPin className="size-3 inline me-0.5" />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* رابط فتح الخريطة */}
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => window.open(mapLink, '_blank')}>
          <Navigation className="size-4 me-1.5" />
          {locale === 'ar' ? 'فتح في OpenStreetMap' : 'Open in OpenStreetMap'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => {
            if (!currentProjectId) return;
            updateProject.mutate({
              id: currentProjectId,
              data: {
                establishment: {
                  ...est,
                  projectLocation: matchedRegion?.name
                    ? `${matchedRegion.name} (${displayLat.toFixed(2)}, ${displayLng.toFixed(2)})`
                    : projectLocation,
                },
              },
            });
          }}
        >
          <Crosshair className="size-4 me-1.5" />
          {locale === 'ar' ? 'حفظ الموقع' : 'Save Location'}
        </Button>
      </div>
    </Card>
  );
}
