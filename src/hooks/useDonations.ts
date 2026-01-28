import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';

export function useStreamerDonations() {
    const { user, authenticated } = usePrivy();
    const { client: smartWalletClient } = useSmartWallets();

    // Determine correct address (Smart Wallet for email users)
    const isEmailUser = user?.wallet?.connectorType === 'embedded';
    const smartWalletAddress = smartWalletClient?.account?.address;
    
    const activeAddress = isEmailUser ? smartWalletAddress : user?.wallet?.address;

    return useQuery({
        queryKey: ['donations', 'streamer', activeAddress],
        queryFn: async () => {
            console.log('[useStreamerDonations] Triggered. Active Address:', activeAddress);
            
            if (!activeAddress) {
                console.log('[useStreamerDonations] No active address. Aborting.');
                return [];
            }

            // Fetch donations with case-insensitive match for wallet address
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .ilike('streamer_wallet', activeAddress)
                .order('created_at', { ascending: false });

            console.log('[useStreamerDonations] Supabase Data:', data);
            
            if (error) {
                console.error('[useStreamerDonations] Error:', error);
                throw error;
            }

            return data || [];
        },
        enabled: authenticated && !!activeAddress, // Only run if authenticated and address available
        staleTime: 1000 * 60, // Cache for 1 minute
        retry: 3,
    });
}
