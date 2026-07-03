'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2, Sparkles, Bot, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AiAnalysisCard() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const displayCurrency = useAppStore((s) => s.displayCurrency);

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!currentProjectId) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: currentProjectId, currency: displayCurrency }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      const data = await res.json();
      setAnalysis(data.analysis);
      toast({ title: t('aiAnalysisTitle') });
    } catch (e) {
      toast({
        title: t('aiAnalysis'),
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // تحويل markdown بسيط إلى HTML
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc ps-6 space-y-1 my-2">
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(<h3 key={idx} className="text-lg font-bold mt-4 mb-2 text-primary">{trimmed.slice(2)}</h3>);
      } else if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(<h4 key={idx} className="text-md font-semibold mt-3 mb-1 text-primary">{trimmed.slice(3)}</h4>);
      } else if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(<h5 key={idx} className="text-sm font-semibold mt-2 mb-1">{trimmed.slice(4)}</h5>);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        listItems.push(trimmed.slice(2));
      } else if (trimmed === '---') {
        flushList();
        elements.push(<hr key={idx} className="my-3 border-muted" />);
      } else if (trimmed) {
        flushList();
        elements.push(<p key={idx} className="text-sm leading-relaxed my-1" dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }} />);
      }
    });
    flushList();
    return elements;
  };

  const renderInline = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-xs">$1</code>');
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Bot className="size-5" />
          </div>
          <div>
            <h3 className="text-md font-semibold flex items-center gap-1.5">
              {t('aiAnalysisTitle')}
              <Sparkles className="size-3.5 text-amber-500" />
            </h3>
            <p className="text-xs text-muted-foreground">
              {locale === 'ar'
                ? 'تحليل ذكي شامل للمشروع مع توصيات احترافية'
                : 'Comprehensive AI analysis with professional recommendations'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleAnalyze}
          disabled={loading || !currentProjectId}
          variant={analysis ? 'outline' : 'default'}
        >
          {loading ? <Loader2 className="size-4 me-1.5 animate-spin" /> :
           analysis ? <RefreshCw className="size-4 me-1.5" /> :
           <Sparkles className="size-4 me-1.5" />}
          {loading ? t('aiAnalyzing') : analysis ? (locale === 'ar' ? 'تحليل جديد' : 'Re-analyze') : t('aiGenerate')}
        </Button>
      </div>

      {loading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 bg-muted/50 rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      )}

      {analysis && !loading && (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
          {renderMarkdown(analysis)}
        </div>
      )}

      {!analysis && !loading && (
        <p className="text-xs text-muted-foreground italic">
          {locale === 'ar'
            ? '💡 اضغط "توليد التحليل" للحصول على تقييم احترافي شامل من الذكاء الاصطناعي يشمل: نقاط القوة والضعف، تقييم المؤشرات، المخاطر، التوصيات، وسيناريوهات التحسين.'
            : '💡 Click "Generate Analysis" to get a comprehensive professional AI evaluation including: strengths/weaknesses, indicators assessment, risks, recommendations, and improvement scenarios.'}
        </p>
      )}
    </Card>
  );
}
