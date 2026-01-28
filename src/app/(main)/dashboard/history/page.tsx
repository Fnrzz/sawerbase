'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Calendar, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStreamerDonations } from '@/hooks/useDonations';

export default function HistoryPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use the new Tanstack Query hook
  const { data: donations = [], isLoading, error } = useStreamerDonations();

  // Redirect if not authenticated
  if (ready && !authenticated) {
    router.push('/');
    return null;
  }

  const filteredDonations = donations.filter(d => 
    d.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!ready || isLoading) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Loading history...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pt-8 flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold">Riwayat Donasi</h1>
        </div>

        {/* Search */}
        <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <Input 
                placeholder="Cari nama atau pesan..." 
                className="pl-12 bg-card border-border h-12 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        {/* List */}
        <div className="flex-grow">
            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <div className="space-y-4">
                {error ? (
                    <div className="p-8 text-center border border-destructive/20 bg-destructive/10 rounded-3xl text-destructive/80">
                        <p>Failed to load donations.</p>
                    </div>
                ) : filteredDonations.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-border rounded-3xl text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>{searchTerm ? 'Tidak ada hasil pencarian.' : 'Tidak ada riwayat donasi ditemukan.'}</p>
                    </div>
                ) : (
                    filteredDonations.map((d) => (
                        <Card key={d.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm ring-1 ring-primary/30">
                                            {d.donor_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">{d.donor_name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(d.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-primary text-lg">
                                            +{parseFloat(d.amount).toLocaleString('id-ID')}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-bold">IDRX</div>
                                    </div>
                                </div>

                                {d.message && (
                                    <div className="bg-muted/50 p-3 rounded-xl text-sm text-foreground/80 italic">
                                        &quot;{d.message}&quot;
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-2 border-t border-border">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                        d.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                    }`}>
                                        {d.status.toUpperCase()}
                                    </span>
                                    
                                    {d.tx_digest && (
                                        <a 
                                            href={`https://sepolia.basescan.org/tx/${d.tx_digest}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Lihat Transaksi <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
                </div>
            </ScrollArea>
        </div>

      </div>
    </div>
  );
}
