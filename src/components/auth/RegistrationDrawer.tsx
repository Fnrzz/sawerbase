'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RegistrationDrawerProps {
  isOpen: boolean;
  walletAddress: string;
}

export function RegistrationDrawer({ isOpen, walletAddress }: RegistrationDrawerProps) {
  const router = useRouter();
  const { user } = usePrivy();
  
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!username || !displayName) {
      setError('Mohon isi semua data.');
      return;
    }
    
    if (username.length < 3) {
      setError('Username minimal 3 karakter.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
       setError('Username hanya boleh huruf, angka, dan underscore.');
       return;
    }

    setIsLoading(true);

    try {
       // Check availability
       const { data: existing } = await supabase
         .from('profiles')
         .select('id')
         .eq('username', username)
         .single();
         
       if (existing) {
          setError('Username sudah dipakai.');
          setIsLoading(false);
          return;
       }

       // Insert Profile
       // Use user.id as privy_user_id
       const { error: insertError } = await supabase
         .from('profiles')
         .insert({
            wallet_address: walletAddress,
            privy_user_id: user?.id,
            username: username,
            display_name: displayName,
         });

       if (insertError) throw insertError;

       toast.success('Profil berhasil dibuat!');
       router.push('/dashboard');
    } catch (err: unknown) {
        console.error('Registration error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Gagal mendaftar.';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Selesaikan Profil Kamu</DialogTitle>
            <DialogDescription>
              Buat profilmu untuk mulai menerima dukungan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
               <Label htmlFor="username">Username</Label>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                 <Input 
                    id="username" 
                    placeholder="kreator_keren" 
                    className="pl-8"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  />
               </div>
               <p className="text-xs text-muted-foreground">Hanya huruf, angka, dan underscore.</p>
            </div>

            <div className="grid gap-2">
               <Label htmlFor="displayName">Display Name</Label>
               <Input 
                  id="displayName" 
                  placeholder="Kreator Keren" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
            </div>
            
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full h-12 rounded-xl text-lg font-bold">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              {isLoading ? 'Memproses...' : 'Buat Profil'}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
