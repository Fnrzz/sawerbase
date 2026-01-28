'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { getProfileByWallet } from '@/lib/supabase-actions';
import { RegistrationDrawer } from '@/components/auth/RegistrationDrawer';
import { toast } from 'sonner';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready, authenticated, user } = usePrivy();
  const { client: smartWalletClient } = useSmartWallets();
  const router = useRouter();

  const [showRegistration, setShowRegistration] = useState(false);
  const [registerAddress, setRegisterAddress] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const isDashboardRoute = pathname?.startsWith('/dashboard');

  useEffect(() => {
    const checkAccess = async () => {
     
      if (!ready || !authenticated || !isDashboardRoute || showRegistration || isChecking) return;

      let targetAddress: string | undefined;
      const isEmailLogin = user?.wallet?.connectorType === 'embedded';

      if (isEmailLogin) {
        if (!smartWalletClient?.account?.address) return; 
        targetAddress = smartWalletClient.account.address;
      } else {
        targetAddress = user?.wallet?.address;
      }

      if (!targetAddress) return;

      setIsChecking(true);
      try {
        // Cek ke Database Supabase
        const profile = await getProfileByWallet(targetAddress);

        if (!profile) {
          console.log('[AuthGuard] Profile missing. Triggering registration.');
          // Simpan alamat yang BENAR ke state agar Drawer tidak bingung
          setRegisterAddress(targetAddress);
          setShowRegistration(true);
          toast.warning("Anda belum terdaftar. Mohon lengkapi profil.", { id: 'auth-guard' });
        } 
      } catch (error) {
        console.error('[AuthGuard] Check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [ready, authenticated, isDashboardRoute, user, smartWalletClient, showRegistration, isChecking]);

  // Jika user belum login tapi maksa masuk dashboard, lempar ke Home
  useEffect(() => {
    if (ready && !authenticated && isDashboardRoute) {
        router.push('/');
    }
  }, [ready, authenticated, isDashboardRoute, router]);

  return (
    <>
      {children}

      {/* Tampilkan Drawer HANYA jika showRegistration true DAN kita punya alamat yang valid */}
      {showRegistration && registerAddress && (
        <RegistrationDrawer 
          isOpen={showRegistration} 
          walletAddress={registerAddress} 
        />
      )}
    </>
  );
}