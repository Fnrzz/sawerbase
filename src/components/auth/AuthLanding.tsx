'use client';


import { LoginButton } from './LoginButton';
import { useLanguage } from '@/context/LanguageContext';

export function AuthLanding() {
  const { t } = useLanguage();


  return (
    <div className="flex flex-col items-center justify-center w-full px-4 text-center space-y-8 max-w-md mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter text-foreground">
          SAWER<span className="text-violet-500">BASE</span>
        </h1>
        <p className="text-muted-foreground">
          {t('landingSubtitle')}
        </p>
      </div>

      <div className="w-full space-y-4">
        {/* Unified Login Button */}
        <div className="flex justify-center">
            <LoginButton />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground px-8">
        {t('termsText')}
      </p>
    </div>
  );
}
