'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { AuthLanding } from '@/components/auth/AuthLanding';
import AuthGuard from '@/components/auth/AuthGuard';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { ready, authenticated } = usePrivy();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // Not Authenticated -> Auth Landing
  if (!authenticated) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <AuthLanding />
        </div>
      );
  }

  // Authenticated -> AuthGuard handles Profile Check & Registration
  // If AuthGuard renders children, it means Profile Exists (or registration completed)
  return (
    <AuthGuard>
       <DashboardRedirector />
    </AuthGuard>
  );
}

function DashboardRedirector() {
    const router = useRouter();
    const { t } = useLanguage();
    
    useEffect(() => {
        router.push('/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
             <h1 className="text-4xl font-black tracking-tighter text-foreground">
               SAWER<span className="text-violet-500">BASE</span>
             </h1>
             <div className="flex flex-col items-center text-muted-foreground text-sm">
                <Loader2 className="w-5 h-5 animate-spin mb-2" />
                {t('redirecting')}
             </div>
        </div>
    );
}
