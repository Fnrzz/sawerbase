'use client';

import { useParams } from 'next/navigation';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const params = useParams<{ address: string }>();
  const address = params?.address;
  
  const { data: leaderboard, isLoading } = useLeaderboard(address || '');

  if (!address) return null;


  const displayData = leaderboard && leaderboard.length > 0 ? leaderboard : [];

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 font-sans">
      <div className="w-[600px] bg-[#6d28d9] py-4 rounded-xl shadow-2xl overflow-hidden border-2 border-transparent">
        {/* Header */}
        <div className="py-2 text-center">
            <h1 className="text-3xl font-black text-white tracking-wide drop-shadow-md">
                Leaderboard
            </h1>
        </div>

        {/* List */}
        <div className="p-4 space-y-1">
            {isLoading ? (
                <div className="text-white text-center">Loading...</div>
            ) : displayData.length === 0 ? (
                <div className="text-white/50 text-center py-4 italic">Belum ada donasi</div>
            ) : (
                displayData.map((item) => (
                    <motion.div 
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between items-center px-4 py-2"
                    >
                        <div className="flex items-center gap-2">
                             <span className="text-xl font-bold text-white w-6">{item.rank}.</span>
                             <span className="text-xl font-bold text-[#bef264] drop-shadow-sm">{item.name}</span>
                        </div>
                        <div className="text-xl font-black text-[#bef264] drop-shadow-sm">
                            {item.formattedAmount}
                        </div>
                    </motion.div>
                ))
            )}
        </div>
        
        {/* Bottom spacer similar to image card roundness */}
        <div className="h-2"></div>
      </div>
    </div>
  );
}
