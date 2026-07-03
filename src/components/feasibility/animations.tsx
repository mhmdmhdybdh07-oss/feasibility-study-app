'use client';

import { useEffect, useRef, useState } from 'react';

// Hook لحساب الأرقام المتحركة (Count Up Animation)
export function useCountUp(target: number, duration: number = 1500, start: boolean = true) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) {
        frame.current = requestAnimationFrame(animate);
      }
    };

    frame.current = requestAnimationFrame(animate);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration, start]);

  return count;
}

// مكوّن رقم متحرك
export function AnimatedNumber({
  value,
  duration = 1500,
  format = (n: number) => n.toLocaleString('ar'),
  className = '',
  suffix = '',
  prefix = '',
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const count = useCountUp(value, duration, inView);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className}>
      {prefix}{format(count)}{suffix}
    </span>
  );
}

// Hook للكشف عند ظهور عنصر في الشاشة (Lazy Reveal)
export function useInView<T extends HTMLElement>(threshold: number = 0.1) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// مكوّن Reveal للظهور التدريجي
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Hook لتأثير النبض (Pulse) عند التحديث
export function usePulse(trigger: any) {
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (trigger === undefined || trigger === null) return;
    // استخدام requestAnimationFrame بدلاً من setState المباشر
    const raf = requestAnimationFrame(() => {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 600);
    });
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return pulsing;
}

// مكوّن شريط تقدم متحرك
export function AnimatedProgress({
  value,
  max = 100,
  className = '',
  color = 'bg-primary',
  height = 'h-2',
}: {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  height?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div ref={ref} className={`${height} bg-secondary rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
        style={{
          width: inView ? `${percentage}%` : '0%',
        }}
      />
    </div>
  );
}

// مكوّن Spinner أنيق
export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// مكوّن Skeleton للتحميل
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  );
}

// مكوّن Badge نابض للتنبيهات
export function PulsingBadge({
  children,
  color = 'bg-red-500',
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span className={`relative inline-flex ${color} text-white text-[10px] font-bold rounded-full px-2 py-0.5`}>
      <span className={`absolute inset-0 ${color} rounded-full animate-ping opacity-75`} />
      <span className="relative">{children}</span>
    </span>
  );
}
