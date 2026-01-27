'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { AuthLanding } from '@/components/auth/AuthLanding';
import { RegistrationDrawer } from '@/components/auth/RegistrationDrawer'; 
import { Loader2 } from 'lucide-react';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

export default function Home() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  
  // Use the new hook
  const { hasProfile, isChecking } = useOnboardingStatus();
  const [showRegister, setShowRegister] = useState(false);

  // Logic: Authenticated -> Check Status -> Redirect OR Show Register
  useEffect(() => {
     if (ready && authenticated && user?.wallet?.address && !isChecking) {
         console.log('[AuthFlow] Check complete. Has Profile?', hasProfile);
         
         if (hasProfile) {
             console.log('[AuthFlow] Redirecting to Dashboard...');
             router.push('/dashboard');
         } else {
             console.log('[AuthFlow] Profile missing. Showing Registration Drawer.');
             // User logged in but no profile? Show Register Drawer!
             // eslint-disable-next-line
             setShowRegister(true);
         }
     } else {
        console.log('[AuthFlow] Waiting...', { ready, authenticated, wallet: !!user?.wallet?.address, isChecking });
     }
  }, [ready, authenticated, user, isChecking, hasProfile, router]);


  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // Show AuthLanding if not authenticated
  if (!authenticated) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <AuthLanding />
        </div>
      );
  }

  // Loading States
  const walletReady = !!user?.wallet?.address;
  // If we are waiting for wallet, or check is running, show loader
  if (!walletReady || isChecking) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
             <h1 className="text-4xl font-black tracking-tighter text-foreground">
               SAWER<span className="text-violet-500">BASE</span>
             </h1>
             <div className="flex flex-col items-center text-muted-foreground text-sm">
                <Loader2 className="w-5 h-5 animate-spin mb-2" />
                {!walletReady ? 'Menyiapkan wallet kamu...' : 'Memuat profilmu...'}
             </div>
        </div>
      );
  }

  // If we reach here: Authenticated, Wallet Ready, Check Done.
  // We either redirected (profile exists) or we show the registration drawer (profile missing).
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
         <div className="text-center space-y-4">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">
              SAWER<span className="text-violet-500">BASE</span>
            </h1>
            {/* If registered, we are redirecting, so show a spinner or nothing */}
            {hasProfile ? (
                 <div className="flex flex-col items-center text-muted-foreground text-sm">
                    <Loader2 className="w-5 h-5 animate-spin mb-2" />
                    Mengalihkan ke dashboard...
                 </div>
            ) : null}
         </div>

         {/* Explicit Registration Drawer */}
         {showRegister && user?.wallet?.address && (
             <RegistrationDrawer 
                isOpen={true} 
                walletAddress={user.wallet.address} 
             />
         )}
    </div>
  );
}
