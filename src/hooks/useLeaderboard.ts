import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';


export interface LeaderboardEntry {
  rank: number;
  name: string;
  amount: number;
  formattedAmount: string;
}

export function useLeaderboard(walletAddress: string) {
  return useQuery({
    queryKey: ['leaderboard', walletAddress],
    queryFn: async () => {
      console.log('[useLeaderboard] Fetching for:', walletAddress);
      
      if (!walletAddress) {
          console.log('[useLeaderboard] No address provided.');
          return [];
      }

      // Fetch donations for this streamer
      // Removed .eq('status', 'completed') to ensure we see data first.
      const { data, error } = await supabase
        .from('donations')
        .select('donor_name, amount, coin_type')
        .ilike('streamer_wallet', decodeURIComponent(walletAddress));

      if (error) {
          console.error('[useLeaderboard] Supabase Error:', error);
          throw error;
      }

      console.log('[useLeaderboard] Raw Data:', data);

      if (!data) return [];

      // Aggregate by donor name
      const totals: Record<string, number> = {};

      data.forEach((donation) => {
        let val = parseFloat(donation.amount);
        if (isNaN(val)) val = 0;
        
        const name = donation.donor_name || 'Anonymous';
        
        if (!totals[name]) totals[name] = 0;
        totals[name] += val;
      });

      // Convert to array and sort
      const leaderboard = Object.entries(totals)
        .map(([name, total]) => ({
          name,
          amount: total,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5) // Top 5
        .map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          amount: entry.amount,
          formattedAmount: `Rp ${entry.amount.toLocaleString('id-ID')}`,
        }));

      return leaderboard;
    },
    enabled: !!walletAddress,
    refetchInterval: 5000, // Live update every 5s
  });
}
