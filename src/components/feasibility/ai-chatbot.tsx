'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/app-store';
import { useProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { Bot, Send, Sparkles, X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateIndicators } from '@/lib/calculations';
import { formatCurrency } from '@/lib/currencies';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatbot() {
  const { locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { data: project } = useProject(currentProjectId);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [{
    role: 'assistant',
    content: locale === 'ar'
      ? 'مرحباً! أنا مساعدك الذكي لدراسات الجدوى. اسألني عن أي شيء يخص مشروعك - المؤشرات المالية، المخاطر، التوصيات، أو أي استفسار آخر.'
      : 'Hello! I\'m your AI feasibility assistant. Ask me anything about your project.',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // فقط للتأثير الجانبي للتمرير
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = (question: string): string => {
    if (!project) {
      return locale === 'ar' ? 'يرجى فتح مشروع أولاً للإجابة على أسئلتك.' : 'Please open a project first.';
    }

    const q = question.toLowerCase();
    const fin = (project.financialStudy as any) ?? {};
    const eco = (project.economicStudy as any) ?? {};
    const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];

    const indicators = calculateIndicators({
      initialInvestment: Number(fin.initialInvestment) || 0,
      fixedAssets: Number(fin.fixedAssets) || 0,
      workingCapital: Number(fin.workingCapital) || 0,
      operatingCosts: Number(fin.operatingCosts) || 0,
      loans: Number(fin.loans) || 0,
      interestRate: Number(fin.interestRate) || 0,
      loanPeriod: Number(fin.loanPeriod) || 0,
      yearsData,
      discountRate: Number(eco.discountRate) || 10,
    });

    const fmt = (v: number) => formatCurrency(v, displayCurrency, locale);

    // ردود بناءً على نوع السؤال
    if (q.includes('npv') || q.includes('قيمة حالية') || q.includes('صافي القيمة')) {
      return locale === 'ar'
        ? `📊 **NPV (صافي القيمة الحالية)** = ${fmt(indicators.npv)}\n\n${indicators.npv > 0 ? '✅ موجب - المشروع يحقق عائداً يفوق معدل الخصم (${eco.discountRate || 10}%). هذا يعني أن المشروع مجدي اقتصادياً.' : '❌ سالب - المشروع لا يحقق العائد المطلوب. راجع الإيرادات والتكاليف.'}`
        : `📊 **NPV** = ${fmt(indicators.npv)}\n\n${indicators.npv > 0 ? '✅ Positive - project exceeds the discount rate.' : '❌ Negative - project does not meet required return.'}`;
    }

    if (q.includes('irr') || q.includes('العائد الداخلي')) {
      return locale === 'ar'
        ? `📈 **IRR (معدل العائد الداخلي)** = ${indicators.irr !== null ? indicators.irr.toFixed(2) + '%' : 'غير محسوب'}\n\nمعدل الخصم = ${eco.discountRate || 10}%\n${indicators.irr !== null && indicators.irr > (Number(eco.discountRate) || 10) ? '✅ IRR أعلى من معدل الخصم = المشروع مجدي' : '❌ IRR أقل من معدل الخصم = يحتاج مراجعة'}`
        : `📈 **IRR** = ${indicators.irr !== null ? indicators.irr.toFixed(2) + '%' : 'N/A'}\nDiscount rate = ${eco.discountRate || 10}%`;
    }

    if (q.includes('مجدي') || q.includes('جدوى') || q.includes('viable') || q.includes('feasib')) {
      return locale === 'ar'
        ? `${indicators.isViable ? '✅ **المشروع مجدي**' : '❌ **المشروع غير مجدي**'}\n\nالسبب: ${indicators.isViable ? `NPV موجب (${fmt(indicators.npv)}) وIRR يفوق معدل الخصم.` : `NPV سالب (${fmt(indicators.npv)}) أو IRR أقل من معدل الخصم.`}\n\nالتوصية: ${indicators.isViable ? 'يمكن المضي قدماً في التنفيذ مع مراقبة دورية.' : 'يرجى مراجعة هيكل التكاليف وزيادة الإيرادات أو تقليل الاستثمار.'}`
        : `${indicators.isViable ? '✅ **Viable**' : '❌ **Not Viable**'} - NPV: ${fmt(indicators.npv)}, IRR: ${indicators.irr?.toFixed(2) ?? 'N/A'}%`;
    }

    if (q.includes('مخاطر') || q.includes('risk')) {
      const risks = (project.riskRegister as any[]) ?? [];
      if (risks.length === 0) return locale === 'ar' ? 'لا توجد مخاطر مسجلة. أضف مخاطر من قسم "إدارة المخاطر".' : 'No risks registered.';
      const highRisks = risks.filter(r => r.probability * r.impact >= 12);
      return locale === 'ar'
        ? `⚠️ **المخاطر المسجلة**: ${risks.length} مخاطر\n• مخاطر عالية: ${highRisks.length}\n• مخاطر متوسطة: ${risks.length - highRisks.length}\n\nأعلى مخاطرة: "${highRisks[0]?.name ?? risks[0]?.name}"\nالإجراء: ${highRisks[0]?.mitigation ?? risks[0]?.mitigation}`
        : `⚠️ ${risks.length} risks registered. High: ${highRisks.length}.`;
    }

    if (q.includes('استثمار') || q.includes('investment') || q.includes('تكلفة')) {
      return locale === 'ar'
        ? `💰 **الاستثمار الأولي**: ${fmt(Number(fin.initialInvestment) || 0)}\n• الأصول الثابتة: ${fmt(Number(fin.fixedAssets) || 0)}\n• رأس المال العامل: ${fmt(Number(fin.workingCapital) || 0)}\n• التكاليف التشغيلية: ${fmt(Number(fin.operatingCosts) || 0)}\n• القروض: ${fmt(Number(fin.loans) || 0)}`
        : `💰 **Investment**: ${fmt(Number(fin.initialInvestment) || 0)}`;
    }

    if (q.includes('ربح') || q.includes('profit') || q.includes('إيراد')) {
      const totalRev = indicators.totalRevenues;
      const totalCost = indicators.totalCosts;
      return locale === 'ar'
        ? `💵 **الإيرادات**: ${fmt(totalRev)}\n💸 **التكاليف**: ${fmt(totalCost)}\n📈 **صافي الربح**: ${fmt(indicators.totalNetProfit)}\n📊 **ROI**: ${indicators.roi.toFixed(2)}%`
        : `💵 Revenue: ${fmt(totalRev)} | 💸 Cost: ${fmt(totalCost)} | 📈 Profit: ${fmt(indicators.totalNetProfit)} | ROI: ${indicators.roi.toFixed(2)}%`;
    }

    if (q.includes('استرداد') || q.includes('payback')) {
      return locale === 'ar'
        ? `⏱️ **فترة الاسترداد**: ${indicators.paybackPeriod !== null ? indicators.paybackPeriod.toFixed(2) + ' سنة' : 'غير محسوبة'}\n⏱️ **فترة الاسترداد المخصومة**: ${indicators.discountedPaybackPeriod !== null ? indicators.discountedPaybackPeriod.toFixed(2) + ' سنة' : 'غير محسوبة'}`
        : `⏱️ Payback: ${indicators.paybackPeriod?.toFixed(2) ?? 'N/A'} years`;
    }

    if (q.includes('swot') || q.includes('سوات') || q.includes('قوة') || q.includes('ضعف')) {
      const swot = (project.swotAnalysis as any) ?? {};
      return locale === 'ar'
        ? `🎯 **تحليل SWOT**:\n✅ نقاط القوة: ${swot.strengths?.length ?? 0}\n❌ نقاط الضعف: ${swot.weaknesses?.length ?? 0}\n💡 الفرص: ${swot.opportunities?.length ?? 0}\n⚠️ التهديدات: ${swot.threats?.length ?? 0}`
        : `🎯 SWOT: S=${swot.strengths?.length ?? 0}, W=${swot.weaknesses?.length ?? 0}, O=${swot.opportunities?.length ?? 0}, T=${swot.threats?.length ?? 0}`;
    }

    if (q.includes('توصية') || q.includes('recommend')) {
      return locale === 'ar'
        ? `📋 **التوصيات**:\n1. ${indicators.isViable ? 'المضي قدماً في التنفيذ' : 'إعادة هيكلة المشروع'}\n2. تنويع مصادر الإيرادات\n3. بناء احتياطي نقدي (10-15%)\n4. متابعة المؤشرات شهرياً\n5. ${indicators.paybackPeriod && indicators.paybackPeriod > 5 ? 'فترة استرداد طويلة - بحث عن طرق لتسريعها' : 'فترة استرداد مقبولة'}`
        : `📋 Recommendations: ${indicators.isViable ? 'Proceed' : 'Restructure'}, diversify revenue, build reserves.`;
    }

    // رد عام
    return locale === 'ar'
      ? `🤔 يمكنني مساعدتك في:\n• المؤشرات المالية (NPV, IRR, ROI)\n• تقييم الجدوى\n• المخاطر\n• الاستثمار والتكاليف\n• الأرباح والإيرادات\n• فترة الاسترداد\n• تحليل SWOT\n• التوصيات\n\nاسألني بشكل محدد!`
      : `🤔 I can help with: NPV, IRR, ROI, feasibility, risks, investment, profits, payback, SWOT, recommendations. Ask me specifically!`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // محاكاة تأخير بسيط
    await new Promise((r) => setTimeout(r, 500));

    const response = generateResponse(userMsg.content);
    setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  const quickQuestions = locale === 'ar'
    ? ['هل المشروع مجدي؟', 'ما هو NPV؟', 'ما هي المخاطر؟', 'كم فترة الاسترداد؟', 'ما هي التوصيات؟']
    : ['Is it viable?', 'What is NPV?', 'What are the risks?', 'Payback period?', 'Recommendations?'];

  return (
    <>
      {/* زر عائم */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 end-6 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center no-print"
          title={locale === 'ar' ? 'مساعد ذكي' : 'AI Assistant'}
        >
          <MessageCircle className="size-6" />
          <span className="absolute -top-1 -end-1 size-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
        </button>
      )}

      {/* نافذة المحادثة */}
      {open && (
        <Card className="fixed bottom-6 end-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl no-print">
          {/* رأس */}
          <div className="flex items-center gap-2 p-3 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="size-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot className="size-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{locale === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}</div>
              <div className="text-[10px] opacity-80 flex items-center gap-1">
                <span className="size-2 bg-emerald-400 rounded-full animate-pulse" />
                {locale === 'ar' ? 'متصل' : 'Online'}
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20 size-8 p-0" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>

          {/* الرسائل */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-2',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] p-2.5 rounded-lg text-xs leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-secondary rounded-bl-none'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="size-4 text-primary animate-pulse" />
                </div>
                <div className="bg-secondary p-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* أسئلة سريعة */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); }}
                  className="text-[10px] px-2 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* إدخال */}
          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={locale === 'ar' ? 'اكتب سؤالك...' : 'Type your question...'}
              className="text-sm"
              disabled={loading}
            />
            <Button size="sm" onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
