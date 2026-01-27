'use client';


import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useRealtimeDonations, type Donation } from '@/hooks/useRealtimeDonations';

export default function Overlay() {
  const params = useParams<{ address: string }>();
  // Ensure address is lowercased for consistent matching if DB stores it lowercased
  const address = params?.address?.toLowerCase();
  
  const { queue, setQueue } = useRealtimeDonations(address);
  const [current, setCurrent] = useState<Donation | null>(null);
  // Effect 1: Process Queue
  useEffect(() => {
    if (current || queue.length === 0) return;

    const next = queue[0];
    // eslint-disable-next-line
    setCurrent(next);
    setQueue((prev) => prev.slice(1));
  }, [current, queue, setQueue]);

  // Effect 2: Timer to clear current notification
  useEffect(() => {
    if (!current) return;

    const timer = setTimeout(() => {
      setCurrent(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [current]);


  if (!address) return null;

  return (
    <div 
        className="fixed top-0 left-0 z-[9999] w-screen h-screen flex items-center justify-center overflow-hidden bg-transparent font-sans"
    >
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 100, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.3 } }}
            className="w-full max-w-xl"
          >
            {/* Purple Retro Card */}
            <div 
                className="relative bg-[#6d28d9] p-6 rounded-none border-2 border-black"
                style={{
                    boxShadow: '10px 10px 0px 0px #000000'
                }}
            >
                {/* Content */}
                <div className="flex flex-col gap-4">
                    
                    {/* Header: Name and Amount */}
                    <div className="flex justify-between items-start">
                        <h1 className="text-4xl font-black text-[#bef264] tracking-tighter drop-shadow-md">
                            {current.donor_name}
                        </h1>
                    </div>

                    {/* Message Body */}
                    <div className="text-2xl font-bold text-white leading-relaxed break-words">
                        {current.message || "Sawer!"}
                    </div>

                    {/* Amount Footer */}
                     <div className="mt-2 text-5xl font-black text-[#bef264] tracking-tight drop-shadow-md">
                        {parseFloat(current.amount).toLocaleString('id-ID')} <span className="text-3xl text-white/80">IDRX</span>
                    </div>

                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
