'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { useBalance } from 'wagmi';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Coins, History, LogOut } from 'lucide-react';
import { IDRX_ADDRESS } from '@/constants/contracts';
import { formatUnits } from 'viem';

export default function Dashboard() {
  const { ready, authenticated, user, logout } = usePrivy();
  const { client: smartWalletClient } = useSmartWallets();
  const router = useRouter();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Determine Active Address (Same logic as useDonationLogic)
  const smartWalletAddress = smartWalletClient?.account?.address;
  const isEmailUser = user?.wallet?.connectorType === 'embedded';
  // If email user, prefer Smart Wallet. Else use connected wallet.
  const activeAddress = (isEmailUser ? smartWalletAddress : user?.wallet?.address) as `0x${string}` | undefined;

  // Wagmi Balance for IDRX
  const { data: balanceData } = useBalance({
    address: activeAddress,
    token: IDRX_ADDRESS,
    query: {
        enabled: !!activeAddress
    }
  });

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
        router.push('/');
        return;
    }

    async function fetchData() {
        if (!activeAddress) return;

        // Fetch Profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('wallet_address', activeAddress)
            .single();
        
        if (profileData) {
            setProfile(profileData);
        }
        setLoading(false);
    }

    fetchData();
  }, [ready, authenticated, user, router, activeAddress]);

  const copyLink = () => {
    if (!profile?.username) return;
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    toast.success('Link donasi disalin!');
  };

  const copyObsLink = (type: 'alert' | 'leaderboard') => {
    if (!activeAddress) return;
    const baseUrl = window.location.origin;
    // Force lowercase to ensure consistent matching with probable lowercase DB entries
    const normalizedAddress = activeAddress.toLowerCase();
    
    const path = type === 'alert' 
        ? `/overlay/${normalizedAddress}`
        : `/overlay/${normalizedAddress}/leaderboard`;
    
    navigator.clipboard.writeText(`${baseUrl}${path}`);
    toast.success(`Link ${type === 'alert' ? 'Notifikasi' : 'Leaderboard'} disalin!`);
  };

  if (!ready || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-4">
        <div className="max-w-md mx-auto space-y-6">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Halo, <span className="text-primary">{profile?.display_name || 'User'}</span> 👋</h1>
                    <p className="text-muted-foreground">Siap menerima saweran hari ini?</p>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                        await logout();
                        router.push('/');
                    }}
                >
                    <LogOut className="w-6 h-6" />
                </Button>
            </div>

            {/* Balance Card */}
            <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden group shadow-sm">
                 <div className="absolute top-0 right-0 p-8 rounded-bl-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                     <Coins className="w-8 h-8 text-primary" />
                 </div>
                 
                 <div className="relative z-10">
                     <p className="text-muted-foreground text-sm font-medium mb-1">Saldo IDRX Kamu</p>
                     <h2 className="text-4xl font-black tracking-tight text-foreground">
                         {balanceData ? parseFloat(formatUnits(balanceData.value, 18)).toLocaleString('id-ID') : '0'} 
                         <span className="text-lg font-bold text-muted-foreground ml-2">IDRX</span>
                     </h2>
                     <p className="text-xs text-muted-foreground mt-2 font-mono">{activeAddress}</p>
                 </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-2">
                    <Button 
                        onClick={copyLink}
                        variant="outline"
                        className="w-16 h-16 rounded-full bg-card border-border hover:bg-muted hover:text-primary p-0 shadow-lg"
                    >
                        <Copy className="w-6 h-6" />
                    </Button>
                    <span className="text-[10px] text-muted-foreground font-medium">Copy Link</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <Button 
                        onClick={() => {
                            if (navigator.share && profile?.username) {
                                navigator.share({
                                    title: `Sawer ${profile.display_name}`,
                                    url: `${window.location.origin}/${profile.username}`
                                });
                            } else {
                                copyLink();
                            }
                        }}
                        variant="outline"
                        className="w-16 h-16 rounded-full bg-card border-border hover:bg-muted hover:text-green-500 p-0 shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                    </Button>
                     <span className="text-[10px] text-muted-foreground font-medium">Share</span>
                </div>

                {/* Overlay removed */}

                <div className="flex flex-col items-center gap-2">
                    <Button 
                        variant="outline"
                        className="w-16 h-16 rounded-full bg-card border-border hover:bg-muted hover:text-blue-500 p-0 shadow-lg"
                        onClick={() => router.push('/dashboard/history')}
                    >
                        <History className="w-6 h-6" />
                    </Button>
                    <span className="text-[10px] text-muted-foreground font-medium">Riwayat</span>
                </div>
            </div>

            {/* OBS Integrations */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 10l5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
                    <span className="text-sm font-bold uppercase tracking-wider">Integrasi OBS</span>
                </div>
                
                <div className="space-y-3">
                    {/* Alert Box */}
                    <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-colors shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                            </div>
                            <div>
                                <div className="font-bold text-sm text-foreground">Overlay Notifikasi</div>
                                <div className="text-xs text-muted-foreground">Alert box saat ada donasi masuk</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyObsLink('alert')} className="text-muted-foreground hover:text-foreground">
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-colors shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                            </div>
                            <div>
                                <div className="font-bold text-sm text-foreground">Overlay Leaderboard</div>
                                <div className="text-xs text-muted-foreground">Klasemen top donatur</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyObsLink('leaderboard')} className="text-muted-foreground hover:text-foreground">
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}
