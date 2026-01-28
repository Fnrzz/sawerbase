'use client';

import { useState } from 'react';
import { createProfile, isUsernameAvailable } from '@/lib/supabase-actions'; // Pastikan import ini benar
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
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    // Validasi Sederhana
    if (!username || !displayName) {
      setError('Mohon isi semua data.');
      return;
    }
    
    if (username.length < 3) {
      setError('Username minimal 3 karakter.');
      return;
    }

    // Hanya huruf kecil, angka, dan underscore
    if (!/^[a-z0-9_]+$/.test(username)) {
       setError('Username hanya boleh huruf kecil, angka, dan underscore (_).');
       return;
    }

    setIsLoading(true);

    try {
       // 1. Cek Username Unik
       const available = await isUsernameAvailable(username);
       if (!available) {
          setError('Username sudah dipakai orang lain.');
          setIsLoading(false);
          return;
       }

       // 2. Simpan ke Supabase
       await createProfile(walletAddress, username, displayName);

       toast.success('Profil berhasil dibuat! Selamat datang.');
       
       // Refresh halaman agar AuthGuard mendeteksi profile baru
       window.location.reload(); 
       
    } catch (err) {
        console.error('Registration error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Gagal mendaftar. Coba lagi.';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
        // Cegah user menutup dialog dengan klik di luar (Force Register)
        // Kita kosongkan handler ini atau beri warning
        toast.error("Anda harus mendaftar untuk mengakses Dashboard.");
    }}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Selesaikan Profil Kamu</DialogTitle>
            <DialogDescription>
              Alamat Wallet: <span className="font-mono text-xs bg-muted p-1 rounded">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
               <Label htmlFor="username">Username (Unik)</Label>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                 <Input 
                    id="username" 
                    placeholder="kreator_keren" 
                    className="pl-8"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} // Auto lowercase & no space
                  />
               </div>
            </div>

            <div className="grid gap-2">
               <Label htmlFor="displayName">Nama Tampilan</Label>
               <Input 
                  id="displayName" 
                  placeholder="Kreator Keren" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
            </div>
            
            {error && <p className="text-sm text-red-500 font-medium animate-pulse">{error}</p>}
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full h-12 rounded-xl text-lg font-bold">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              {isLoading ? 'Simpan Profil' : 'Mulai Sekarang'}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}