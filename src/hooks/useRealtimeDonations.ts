import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface Donation {
  id: number;
  donor_name: string;
  message: string;
  amount: string;
  coin_type: string;
  streamer_wallet: string;
  created_at: string;
  status: string; // Added status field
}

export function useRealtimeDonations(address?: string) {
  const [queue, setQueue] = useState<Donation[]>([]);
  const processedIdsRef = useRef<Set<number>>(new Set());
  const mountTimeRef = useRef<string>(new Date().toISOString());

  // Helper to safely add to queue
  const addDonation = (donation: Donation) => {
    // Correctness Check: Only show COMPLETED donations
    if (donation.status !== 'completed') return;

    if (processedIdsRef.current.has(donation.id)) return;
    
    // Double check address match (client-side safety)
    if (donation.streamer_wallet?.toLowerCase() !== address?.toLowerCase()) return;

    console.log('[useRealtimeDonations] Adding COMPLETED donation:', donation.id);
    processedIdsRef.current.add(donation.id);
    setQueue(prev => [...prev, donation]);
  };

  useEffect(() => {
    if (!address) return;

    console.log('[useRealtimeDonations] Subscribing for:', address);
    
    // 1. Realtime Subscription (INSERT + UPDATE)
    const channel = supabase
      .channel('donations-overlay')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and UPDATE
          schema: 'public',
          table: 'donations',
        },
        (payload) => {
          const newDonation = payload.new as Donation;
          // Filter by address AND status
          if (newDonation.streamer_wallet?.toLowerCase() === address.toLowerCase()) {
             addDonation(newDonation);
          }
        }
      )
      .subscribe((status) => {
         if (status === 'CHANNEL_ERROR') {
             console.error('[useRealtimeDonations] Channel Error.');
         }
      });

    // 2. Polling Fallback (every 3s)
    const interval = setInterval(async () => {
      // Fetch new donations created after mount time
      const { data } = await supabase
        .from('donations')
        .select('*')
        .ilike('streamer_wallet', address)
        .eq('status', 'completed') // Only fetch COMPLETED
        .gt('created_at', mountTimeRef.current)
        .order('created_at', { ascending: true });

      if (data) {
        data.forEach((d) => {
           addDonation(d as Donation);
        });
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return { queue, setQueue };
}
