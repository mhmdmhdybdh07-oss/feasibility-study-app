'use client';

import { useAppStore } from '@/store/app-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  mainCurrency: string;
  displayCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFull extends ProjectListItem {
  establishment: any;
  socialStudy: any;
  environmentalStudy: any;
  legalStudy: any;
  marketStudy: any;
  technicalStudy: any;
  financialStudy: any;
  economicStudy: any;
  exchangeRates: any;
  language: string;
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      return data.projects as ProjectListItem[];
    },
  });
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      const data = await res.json();
      return data.project as ProjectFull;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description?: string; mainCurrency?: string; displayCurrency?: string }) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const data = await res.json();
      return data.project as ProjectFull;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProjectFull> }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update project');
      const result = await res.json();
      return result.project as ProjectFull;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', vars.id] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  const setCurrentProjectId = useAppStore((s) => s.setCurrentProjectId);
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setCurrentProjectId(null);
      toast.success('تم الحذف بنجاح');
    },
  });
}

export function useDuplicateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name?: string }) => {
      const res = await fetch(`/api/projects/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to duplicate');
      const data = await res.json();
      return data.project as ProjectFull;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('تم تكرار المشروع بنجاح');
    },
  });
}
