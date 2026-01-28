'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, ExternalLink, LayoutGrid } from 'lucide-react';

import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';

export default function TipAlert() {
  const { user, authenticated } = usePrivy();
  const { client: smartWalletClient } = useSmartWallets();
  const { address: wagmiAddress } = useAccount();
  
  // Determine Active Address
  const isEmailUser = user?.wallet?.connectorType === 'embedded';
  const smartWalletAddress = smartWalletClient?.account?.address;
  
  const activeAddress = isEmailUser 
      ? smartWalletAddress 
      : (user?.wallet?.address || wagmiAddress);

  const address = activeAddress;
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) {
        // router.push('/');
        // return;
    }
    // eslint-disable-next-line
    setLoading(false);
  }, [authenticated, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  // Use address logic similar to dashboard, but for now fallback is needed? 
  // Actually dashboard/page.tsx uses address.
  const overlayUrl = `${domain}/overlay/${address || '0x...'}`;

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-24">
        <header className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Tip Alert</h1>
            <p className="text-muted-foreground">Pengaturan notifikasi donasi di OBS.</p>
        </header>

        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
                <div className="p-3 bg-purple-500/10 rounded-xl text-primary">
                     <LayoutGrid className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">URL Overlay Alert</h2>
                    <p className="text-muted-foreground">Gunakan URL ini di OBS untuk menampilkan notifikasi donasi real-time.</p>
                </div>
            </div>

            <div className="space-y-2 mb-8">
                <Label className="text-muted-foreground font-medium">Link Overlay</Label>
                <div className="flex gap-3">
                    <Input 
                        value={overlayUrl} 
                        readOnly 
                        className="bg-muted border-input text-foreground h-12 rounded-xl focus:border-primary/50" 
                    />
                    <Button 
                         onClick={() => copyToClipboard(overlayUrl)}
                         className="h-12 w-12 rounded-xl bg-muted border border-border hover:bg-muted/80"
                         size="icon"
                         variant="ghost"
                    >
                        <Copy className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <Button 
                         onClick={() => window.open(overlayUrl, '_blank')}
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
                    <li>Atur ukuran: Lebar 100% (sesuai canvas), Tinggi 100%</li>
                    <li>Centang &quot;Control audio via OBS&quot; jika ingin mengatur volume di mixer</li>
                </ol>
            </div>
        </div>
    </div>
  );
}
