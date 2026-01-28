'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, ExternalLink, Trophy } from 'lucide-react';

export default function Leaderboard() {
  const { user, authenticated } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const address = user?.wallet?.address || wagmiAddress;

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) {
        router.push('/');
        return;
    }
    // eslint-disable-next-line
    setLoading(false);
  }, [authenticated, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const leaderboardUrl = `${domain}/leaderboard/${address || '0x...'}`;

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24">
        <header className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Leaderboard</h1>
            <p className="text-muted-foreground">Pengaturan tampilan klasemen donatur teratas.</p>
        </header>

        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                     <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">URL Leaderboard Overlay</h2>
                    <p className="text-muted-foreground">Gunakan URL ini di OBS untuk menampilkan leaderboard.</p>
                </div>
            </div>

            <div className="space-y-2 mb-8">
                <Label className="text-muted-foreground font-medium">Link Overlay</Label>
                <div className="flex gap-3">
                    <Input 
                        value={leaderboardUrl} 
                        readOnly 
                        className="bg-muted border-input text-foreground h-12 rounded-xl focus:border-primary/50" 
                    />
                    <Button 
                         onClick={() => copyToClipboard(leaderboardUrl)}
                         className="h-12 w-12 rounded-xl bg-muted border border-border hover:bg-muted/80"
                         size="icon"
                         variant="ghost"
                    >
                        <Copy className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <Button 
                         onClick={() => window.open(leaderboardUrl, '_blank')}
                         className="h-12 w-12 rounded-xl bg-muted border border-border hover:bg-muted/80"
                         size="icon"
                         variant="ghost"
                    >
                        <ExternalLink className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                <h3 className="text-foreground font-bold mb-4">Cara pakai di OBS:</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                    <li>Tambah Source baru &gt; Browser</li>
                    <li>Tempel URL di atas</li>
                    <li>Atur ukuran: Lebar 400px, Tinggi 600px</li>
                    <li>Leaderboard akan muncul otomatis saat ada data</li>
                </ol>
            </div>
        </div>
    </div>
  );
}
