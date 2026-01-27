'use client';


import { LoginButton } from './LoginButton';

export function AuthLanding() {


  return (
    <div className="flex flex-col items-center justify-center w-full px-4 text-center space-y-8 max-w-md mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter text-foreground">
          SAWER<span className="text-violet-500">BASE</span>
        </h1>
        <p className="text-muted-foreground">
          Dukung kreator favoritmu dengan IDRX di Base Sepolia.
        </p>
      </div>

      <div className="w-full space-y-4">
        {/* Unified Login Button */}
        <div className="flex justify-center">
            <LoginButton />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground px-8">
        Dengan masuk, kamu menyetujui Syarat & Ketentuan SawerBase beta.
      </p>
    </div>
  );
}
