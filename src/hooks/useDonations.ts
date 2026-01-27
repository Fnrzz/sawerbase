import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { usePrivy } from '@privy-io/react-auth';

export function useStreamerDonations() {
    const { user, authenticated } = usePrivy();
    const walletAddress = user?.wallet?.address;

    return useQuery({
        queryKey: ['donations', 'streamer', walletAddress],
        queryFn: async () => {
            console.log('[useStreamerDonations] Triggered. Wallet:', walletAddress);
            
            if (!walletAddress) {
                console.log('[useStreamerDonations] No wallet address. Aborting.');
                return [];
            }

            // Fetch donations with case-insensitive match for wallet address
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .ilike('streamer_wallet', walletAddress)
                .order('created_at', { ascending: false });

            console.log('[useStreamerDonations] Supabase Data:', data);
            
            if (error) {
                console.error('[useStreamerDonations] Error:', error);
                throw error;
            }

            return data || [];
        },
        enabled: authenticated && !!walletAddress, // Only run if authenticated and address available
        staleTime: 1000 * 60, // Cache for 1 minute
        retry: 3,
    });
}
