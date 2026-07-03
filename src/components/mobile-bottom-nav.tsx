'use client';

import { useAppStore } from '@/store/app-store';
import { LayoutDashboard, Sparkles, BarChart3, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const currentProjectId = useAppStore((s) => s.currentProjectId);

  const items = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
    { key: 'samples', icon: Sparkles, label: 'نماذج' },
    { key: 'establishment', icon: FileText, label: 'الدراسة', needsProject: true },
    { key: 'results', icon: BarChart3, label: 'النتائج', needsProject: true },
  ];

  return (
    <div className="mobile-bottom-nav no-print">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.key;
        const disabled = item.needsProject && !currentProjectId;
        return (
          <button
            key={item.key}
            className={cn(isActive && 'active')}
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              setActiveSection(item.key);
            }}
          >
            <Icon className="size-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
