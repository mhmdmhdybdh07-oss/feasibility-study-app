'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FieldWithCurrency } from './field-with-currency';
import type { ReactNode } from 'react';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'currency' | 'date';
  placeholder?: string;
  required?: boolean;
  half?: boolean; // يأخذ نصف العرض
  unit?: string;
}

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  fields: FieldDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function FormSection({ title, description, icon, fields, values, onChange }: FormSectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        {icon && <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">{icon}</div>}
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={`space-y-1.5 ${f.half ? '' : 'md:col-span-2'}`}>
            <Label htmlFor={f.key} className="text-sm font-medium">
              {f.label}
              {f.required && <span className="text-destructive ms-1">*</span>}
              {f.unit && <span className="text-muted-foreground text-xs me-1">({f.unit})</span>}
            </Label>
            {f.type === 'textarea' ? (
              <Textarea
                id={f.key}
                value={values[f.key] ?? ''}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={3}
                className="resize-y"
              />
            ) : f.type === 'currency' ? (
              <FieldWithCurrency
                value={values[f.key] ?? ''}
                onChange={(v) => onChange(f.key, v)}
                placeholder={f.placeholder}
              />
            ) : (
              <Input
                id={f.key}
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                value={values[f.key] ?? ''}
                onChange={(e) => onChange(f.key, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
