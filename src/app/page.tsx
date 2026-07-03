'use client';

import { useAppStore } from '@/store/app-store';
import { TopMenuBar } from '@/components/top-menu-bar';
import { AIChatbot } from '@/components/feasibility/ai-chatbot';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy Loading لتسريع التحميل الأولي
const DashboardSection = lazy(() => import('@/components/feasibility/dashboard-section').then(m => ({ default: m.DashboardSection })));
const EstablishmentSection = lazy(() => import('@/components/feasibility/establishment-section').then(m => ({ default: m.EstablishmentSection })));
const SocialSection = lazy(() => import('@/components/feasibility/social-section').then(m => ({ default: m.SocialSection })));
const EnvironmentalSection = lazy(() => import('@/components/feasibility/environmental-section').then(m => ({ default: m.EnvironmentalSection })));
const LegalSection = lazy(() => import('@/components/feasibility/legal-section').then(m => ({ default: m.LegalSection })));
const MarketSection = lazy(() => import('@/components/feasibility/market-section').then(m => ({ default: m.MarketSection })));
const TechnicalSection = lazy(() => import('@/components/feasibility/technical-section').then(m => ({ default: m.TechnicalSection })));
const FinancialSection = lazy(() => import('@/components/feasibility/financial-section').then(m => ({ default: m.FinancialSection })));
const EconomicSection = lazy(() => import('@/components/feasibility/economic-section').then(m => ({ default: m.EconomicSection })));
const ResultsSection = lazy(() => import('@/components/feasibility/results-section').then(m => ({ default: m.ResultsSection })));
const SamplesBrowserSection = lazy(() => import('@/components/feasibility/samples-browser-section').then(m => ({ default: m.SamplesBrowserSection })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

function MainContent() {
  const activeSection = useAppStore((s) => s.activeSection);

  const sections: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    samples: <SamplesBrowserSection />,
    establishment: <EstablishmentSection />,
    socialStudy: <SocialSection />,
    environmentalStudy: <EnvironmentalSection />,
    legalStudy: <LegalSection />,
    marketStudy: <MarketSection />,
    technicalStudy: <TechnicalSection />,
    financialStudy: <FinancialSection />,
    economicStudy: <EconomicSection />,
    results: <ResultsSection />,
  };

  return (
    <Suspense fallback={<PageLoader />}>
      {sections[activeSection] ?? <DashboardSection />}
    </Suspense>
  );
}

export default function Home() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background">
        <TopMenuBar />
        <main className="flex-1 container mx-auto max-w-7xl p-4 md:p-6">
          <MainContent />
        </main>
        <footer className="border-t bg-background/95 py-3 px-4 text-center text-xs text-muted-foreground no-print mt-auto">
          <span>© {new Date().getFullYear()} </span>
          <span className="font-medium">برنامج إعداد دراسات الجدوى</span>
          <span> · </span>
          <span>الريال اليمني (YER) كعملة رئيسية</span>
        </footer>
      </div>
      <AIChatbot />
      <MobileBottomNav />
    </QueryClientProvider>
  );
}
