'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatUnits } from 'viem';
import { useDonationLogic } from '@/hooks/useDonationLogic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, AlertTriangle, Wallet, Fuel, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface DonationWidgetProps {
  streamerAddress: string;
  streamerName: string;
  streamerUsername: string;
}

const PRESET_AMOUNTS = [10000, 50000, 100000, 500000];

const formatRupiah = (value: string) => {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export function DonationWidget({ streamerAddress, streamerName, streamerUsername }: DonationWidgetProps) {
  const [amount, setAmount] = useState('10000');
  const [message, setMessage] = useState('');
  const [donorName, setDonorName] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { t } = useLanguage();

  // Track last action for Supabase logging ('APPROVE' or 'DONATE')
  const lastActionRef = useRef<'APPROVE' | 'DONATE' | null>(null);

  const { 
    status, 
    hasBalance,
    hasEth,
    login,
    approve, 
    donate, 
    isProcessing, 
    isConfirmed, 
    hash,
    error,
    balance,
    logout
  } = useDonationLogic(amount, streamerAddress);

  const handleMainAction = () => {
    if (!amount || parseFloat(amount) < 10000) {
      toast.error(t('minDonation'));
      return;
    }
    
    // Gas Check - DISABLED for Gas Sponsorship
    // if (!hasEth) {
    //    toast.warning(t('noEthGas'));
    // }

    if (status === 'LOGIN_NEEDED') {
        login();
    } else if (status === 'APPROVE_NEEDED') {
      lastActionRef.current = 'APPROVE';
      approve();
    } else if (status === 'READY_TO_DONATE') {
      // Open Confirmation Drawer
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmDonate = () => {
      lastActionRef.current = 'DONATE';
      const nameToUse = donorName || t('someone');
      donate(nameToUse, message);
      setIsConfirmOpen(false);
  };

  // Handle Transaction Success
  const handleTxSuccess = useCallback(async () => {
    if (lastActionRef.current === 'DONATE') {
      toast.success(t('donationSubmitted'));
      
      setAmount('');
      setMessage('');
      toast.info(t('messageSent'));
      
      lastActionRef.current = null; // Reset
    } else if (lastActionRef.current === 'APPROVE') {
      toast.info(t('approvalSubmitted'));
      lastActionRef.current = null;
    }
  }, [t]);

  // Watch for confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
       toast.success(t('txConfirmed'));
       handleTxSuccess();
    }
  }, [isConfirmed, hash, handleTxSuccess]);

  // Watch for Errors
  useEffect(() => {
    if (error) {
      toast.error(error.message || t('txFailed'));
    }
  }, [error, t]);

  const getButtonText = () => {
    if (isProcessing) return t('processing');
    if (status === 'LOGIN_NEEDED') return t('loginToDonate');
    if (status === 'APPROVE_NEEDED') return t('approveIdrx');
    if (status === 'READY_TO_DONATE') return t('reviewDonation');
    if (status === 'CHECKING') return t('checking');
    return t('enterAmount');
  };

  const isButtonDisabled = 
    isProcessing || 
    !amount || 
    parseFloat(amount) < 10000 || 
    status === 'IDLE' || 
    status === 'CHECKING' ||
    (status === 'READY_TO_DONATE' && !hasBalance);

  return (
    <div className="w-full space-y-6 py-24"> 
        {/* pb-32 for Sticky Button clearance */}
        
        {/* New Profile Card Structure */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            {/* Banner Area */}
             <div className="h-32 w-full bg-primary/5 relative overflow-hidden">
                {/* CSS Pattern for "cloud/wave" look - simplistic version with radial dots/circles */}
                 <div className="absolute inset-0 opacity-[0.15]" 
                      style={{ 
                          backgroundImage: "radial-gradient(#9333ea 2px, transparent 2px)", 
                          backgroundSize: "24px 24px" 
                      }}>
                 </div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-8 pt-0 text-center relative">
                 <div className="w-28 h-28 rounded-full bg-background p-1.5 mx-auto -mt-14 relative z-10 transition-transform hover:scale-105 duration-300">
                    <div className="w-full h-full rounded-full bg-primary/5 flex items-center justify-center text-primary border border-border/50 shadow-sm overflow-hidden">
                        <User className="w-12 h-12" />
                    </div>
                </div>
                
                <div className="mt-4 space-y-1">
                    <h2 className="text-2xl font-bold text-foreground">{streamerName}</h2>
                    <p className="text-muted-foreground text-sm">{t('supporterOf')} {streamerUsername}</p>
                </div>
            </div>
        </div>

        {/* Badges Section */}
        <div className="flex items-center gap-3">
             <Badge variant="secondary" className="bg-purple-100 text-purple-600 hover:bg-purple-200 border-none px-3 py-1.5 rounded-lg uppercase tracking-wider font-bold text-[10px]">
                {t('tip')}
            </Badge>
             <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 hover:from-emerald-200 hover:to-green-200 border border-emerald-200/50 gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all cursor-default">
                <Zap className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-600" />
                {t('gasFree')}
            </Badge>
        </div>

        {/* CTA Text Header */}
        <div className="space-y-1">
            <h1 className="text-xl font-black uppercase text-foreground leading-tight">
                {t('giveTipFor')} <span className="text-primary">{streamerName?.toUpperCase()}</span>
            </h1>
            <p className="text-muted-foreground text-sm">
                {t('tipDescription')}
            </p>
        </div>

        {/* Amount Input */}
        <div className="space-y-4 pt-2">
             <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm relative overflow-hidden">
                 <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2 block">{t('donationAmount')}</label>
                 
                 <div className="flex items-baseline justify-center gap-2">
                    <input 
                        type="text"
                        placeholder="0"
                        className="bg-transparent border-none outline-none text-center text-5xl font-black text-foreground placeholder:text-muted focus:outline-none focus:ring-0 w-full p-0 tracking-tighter"
                        value={formatRupiah(amount)}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setAmount(val);
                        }}
                    />
                 </div>
                 <div className="text-primary font-bold mt-1">IDRX</div>
             </div>
        
            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map(val => (
                <button 
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className={cn(
                        "py-3 rounded-xl text-xs font-bold border transition-all",
                        amount === val.toString() 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                    )}
                >
                    {val / 1000}k
                </button>
              ))}
            </div>

             <div className="flex items-center justify-center gap-2 pt-2 opacity-80">
                <div className="h-[1px] bg-border flex-1"></div>
                <p className="text-sm text-center text-muted-foreground px-2 whitespace-nowrap">
                    {t('platformFee')}
                </p>
                <div className="h-[1px] bg-border flex-1"></div>
            </div>
        </div>
        
        {/* Info Inputs */}
        <div className="space-y-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase mb-2 block">{t('fromWho')}</Label>
                <Input 
                    placeholder={t('yourNameOptional')}
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    className="bg-muted/50 border-input h-12 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                />
            </div>


            <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase mb-2 block">{t('messageLabel')}</Label>
                <Textarea 
                    placeholder={t('messagePlaceholder')}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="bg-muted/50 border-input min-h-[150px] rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:border-primary/50"
                    maxLength={200}
                />
                 <div className="text-right text-xs text-muted-foreground mt-1">{message.length}/200</div>
            </div>
        </div>

        {/* Balance Info */}
         {status !== 'LOGIN_NEEDED' && (
            <div className="flex justify-between items-center px-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        <span>{t('balance')}: {balance ? parseFloat(formatUnits(balance, 18)).toLocaleString('id-ID') : '0'} IDRX</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={logout} 
                        className="text-destructive/80 hover:text-destructive transition-colors uppercase font-bold text-[10px]"
                    >
                        {t('disconnect')}
                    </button>
                </div>
            </div>
        )}

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-[480px] pointer-events-auto bg-background/90 backdrop-blur-xl border-t border-border p-4">
                <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-lg disabled:opacity-50 shadow-lg shadow-primary/20"
                    onClick={handleMainAction}
                    disabled={isButtonDisabled}
                >
                    {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    {!hasBalance && status !== 'APPROVE_NEEDED' && status !== 'LOGIN_NEEDED' ? t('insufficientBalance') : getButtonText()}
                </Button>
            </div>
        </div>

        {/* Confirmation Drawer */}
        <Drawer open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DrawerContent className="bg-card border-t border-border text-foreground">
                <div className="max-w-md mx-auto w-full">
                    <DrawerHeader>
                        <DrawerTitle className="text-center text-xl">{t('confirmDonation')}</DrawerTitle>
                        <DrawerDescription className="text-center text-muted-foreground">
                            {t('confirmDesc')}
                        </DrawerDescription>
                    </DrawerHeader>
                    
                    <div className="p-4 space-y-4">
                        <div className="bg-muted/50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('amount')}</span>
                                <span className="font-bold text-primary">{formatRupiah(amount)} IDRX</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('streamer')}</span>
                                <span className="font-bold text-foreground">{streamerName}</span>
                            </div>
                            <div className="border-t border-border my-2 pt-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('from')}</span>
                                    <span className="font-bold text-foreground">{donorName || t('someone')}</span>
                                </div>
                                {message && (
                                    <div className="mt-2 text-sm text-muted-foreground italic">
                                        &quot;{message}&quot;
                                    </div>
                                )}
                            </div>
                        </div>

                         <Button 
                            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg"
                            onClick={handleConfirmDonate}
                        >
                            {t('confirmSend')}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full text-muted-foreground">{t('cancel')}</Button>
                        </DrawerClose>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    </div>
  );
}
