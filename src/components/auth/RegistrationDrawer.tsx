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
import { useLanguage } from '@/context/LanguageContext';

interface RegistrationDrawerProps {
  isOpen: boolean;
  walletAddress: string;
}

export function RegistrationDrawer({ isOpen, walletAddress }: RegistrationDrawerProps) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    // Validasi Sederhana
    if (!username || !displayName) {
      setError(t('validationStart'));
      return;
    }
    
    if (username.length < 3) {
      setError(t('validationLength'));
      return;
    }

    // Hanya huruf kecil, angka, dan underscore
    if (!/^[a-z0-9_]+$/.test(username)) {
       setError(t('validationChars'));
       return;
    }

    setIsLoading(true);

    try {
       // 1. Cek Username Unik
       const available = await isUsernameAvailable(username);
       if (!available) {
          setError(t('usernameTaken'));
          setIsLoading(false);
          return;
       }

       // 2. Simpan ke Supabase
       await createProfile(walletAddress, username, displayName);

       toast.success(t('registrationSuccess'));
       
       // Refresh halaman agar AuthGuard mendeteksi profile baru
       window.location.reload(); 
       
    } catch (err) {
        console.error('Registration error:', err);
        const errorMessage = err instanceof Error ? err.message : t('registrationFailed');
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
        // Cegah user menutup dialog dengan klik di luar (Force Register)
        // Kita kosongkan handler ini atau beri warning
        toast.error(t('mustRegister'));
    }}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t('completeProfile')}</DialogTitle>
            <DialogDescription>
              {t('walletAddress')}: <span className="font-mono text-xs bg-muted p-1 rounded">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
               <Label htmlFor="username">{t('usernameLabel')}</Label>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                 <Input 
                    id="username" 
                    placeholder={t('usernamePlaceholder')}  
                    className="pl-8"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} // Auto lowercase & no space
                  />
               </div>
            </div>

            <div className="grid gap-2">
               <Label htmlFor="displayName">{t('displayNameLabel')}</Label>
               <Input 
                  id="displayName" 
                  placeholder={t('displayNamePlaceholder')} 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
            </div>
            
            {error && <p className="text-sm text-red-500 font-medium animate-pulse">{error}</p>}
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full h-12 rounded-xl text-lg font-bold">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              {isLoading ? t('saveProfile') : t('startNow')}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}