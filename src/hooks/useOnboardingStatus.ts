import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/lib/supabase';

export function useOnboardingStatus() {
  const { authenticated, ready, user } = usePrivy();
  const [hasProfile, setHasProfile] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    async function checkProfile() {
      // If we are not ready, or not authenticated, or don't have a wallet yet, we can't check efficiently.
      // However, if authenticated is true BUT wallet is missing, we are likely 'pending' wallet creation.
      // We should probably report 'isChecking = true' or handle that state upstream.
      
      if (!ready || !authenticated || !user?.wallet?.address) {
        setIsChecking(false);
        // Note: If authenticated && !wallet, we might ideally stay isChecking=true?
        // But let's stick to the prompt: strict logic based on address presence.
        return;
      }

      setIsChecking(true);
      console.log('[OnboardingStatus] Checking:', user.wallet.address);

      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', user.wallet.address)
          .single();

        if (data) {
          setHasProfile(true);
          setProfileData(data);
        } else {
          setHasProfile(false);
          setProfileData(null);
        }
      } catch (err) {
        console.error('[OnboardingStatus] Error:', err);
        setHasProfile(false);
      } finally {
        setIsChecking(false);
      }
    }

    if (ready && authenticated && user?.wallet?.address) {
      checkProfile();
    }
  }, [ready, authenticated, user]);

  return { isChecking, hasProfile, profileData };
}
