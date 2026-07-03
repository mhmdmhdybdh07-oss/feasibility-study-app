'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus, LogOut, Shield } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (open) {
      fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user ?? null));
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, name };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setUser(data.user);
      qc.invalidateQueries();
      toast({ title: mode === 'login' ? t('login') : t('register') + ' ✓' });
      onOpenChange(false);
      setEmail(''); setPassword(''); setName('');
    } catch (e) {
      toast({ title: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    qc.invalidateQueries();
    toast({ title: t('logout') });
  };

  const roleBadge: Record<string, { ar: string; en: string; color: string }> = {
    admin: { ar: 'مدير', en: 'Admin', color: 'bg-destructive text-white' },
    analyst: { ar: 'محلل', en: 'Analyst', color: 'bg-blue-500 text-white' },
    viewer: { ar: 'مشاهد', en: 'Viewer', color: 'bg-muted text-muted-foreground' },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            {user ? (locale === 'ar' ? 'الحساب' : 'Account') : (mode === 'login' ? t('login') : t('register'))}
          </DialogTitle>
          <DialogDescription>
            {user
              ? (locale === 'ar' ? 'أنت مسجّل الدخول' : 'You are signed in')
              : (locale === 'ar' ? 'سجّل الدخول أو أنشئ حساباً جديداً' : 'Sign in or create a new account')}
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <Badge className={roleBadge[user.role]?.color ?? ''}>
                {roleBadge[user.role]?.[locale] ?? user.role}
              </Badge>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="size-4 me-2" />
              {t('logout')}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={mode === 'login' ? 'default' : 'outline'}
                onClick={() => setMode('login')}
                className="w-full"
              >
                <LogIn className="size-4 me-1.5" />
                {t('login')}
              </Button>
              <Button
                variant={mode === 'register' ? 'default' : 'outline'}
                onClick={() => setMode('register')}
                className="w-full"
              >
                <UserPlus className="size-4 me-1.5" />
                {t('register')}
              </Button>
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-name">{t('name')}</Label>
                <Input
                  id="auth-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={locale === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="auth-email">{t('email')}</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="auth-pass">{t('password')}</Label>
              <Input
                id="auth-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {mode === 'register' && (
              <p className="text-[11px] text-muted-foreground">
                {locale === 'ar'
                  ? '💡 أول مستخدم يسجّل يصبح مديراً (admin). الباقون محللون.'
                  : '💡 First user becomes admin. Others are analysts.'}
              </p>
            )}

            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? <Loader2 className="size-4 me-2 animate-spin" /> :
                mode === 'login' ? <LogIn className="size-4 me-2" /> : <UserPlus className="size-4 me-2" />}
              {mode === 'login' ? t('login') : t('register')}
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
