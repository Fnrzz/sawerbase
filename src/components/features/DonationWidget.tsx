'use client';

import { useState, useEffect, useRef } from 'react';
import { formatUnits } from 'viem';
import { useDonationLogic } from '@/hooks/useDonationLogic';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { toast } from 'sonner';
import { Loader2, User, AlertTriangle, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isPrivate, setIsPrivate] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
      toast.error('Minimum donasi adalah 10.000 IDRX');
      return;
    }
    
    // Gas Check
    if (!hasEth) {
        toast.warning('Kamu tidak punya ETH untuk gas fee di Base Sepolia!');
    }

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
      donate();
      setIsConfirmOpen(false);
  };

  // Handle Transaction Success
  const handleTxSuccess = async (txHash: string) => {
    if (lastActionRef.current === 'DONATE') {
      toast.success('Donation submitted! Waiting for confirmation...');
      
      const { error: dbError } = await supabase.from('donations').insert({
        donor_name: isPrivate ? 'Anonymous' : (donorName || 'Someone'),
        message: message || '',
        amount: amount,
        coin_type: 'IDRX',
        tx_digest: txHash,
        streamer_wallet: streamerAddress,
        status: 'completed',
      });

      if (dbError) {
        console.error('Supabase Error:', dbError);
        toast.error('Failed to save donation message.');
      } else {
        setAmount('');
        setMessage('');
        toast.info('Message sent to overlay!');
      }
      lastActionRef.current = null; // Reset
    } else if (lastActionRef.current === 'APPROVE') {
      toast.info('Approval submitted. You can now donate once confirmed.');
      lastActionRef.current = null;
    }
  };

  // Watch for confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
       toast.success('Transaction confirmed!');
       handleTxSuccess(hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, hash]);

  // Watch for Errors
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Transaction failed');
    }
  }, [error]);

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (status === 'LOGIN_NEEDED') return 'Login to Donate';
    if (status === 'APPROVE_NEEDED') return 'Approve IDRX';
    if (status === 'READY_TO_DONATE') return 'Review Donation';
    if (status === 'CHECKING') return 'Checking...';
    return 'Enter Amount';
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
        {/* pb-24 for Sticky Button clearance */}
        
        {/* Streamer Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
             <div className="w-24 h-24 rounded-full bg-muted p-1.5">
                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/30">
                    <User className="w-10 h-10" />
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-foreground">{streamerName}</h2>
                <p className="text-muted-foreground text-sm">@{streamerUsername}</p>
            </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-4">
             <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
                 <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2 block">NOMINAL DONASI</label>
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
        </div>
        
        {/* Info Inputs */}
        <div className="space-y-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase mb-2 block">DARI SIAPA?</Label>
                <Input 
                    placeholder="Nama Kamu (Opsional)"
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    className="bg-muted/50 border-input h-12 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                />
            </div>

            <div className="flex items-center justify-between py-2">
                <Label htmlFor="private-mode" className="text-muted-foreground text-sm cursor-pointer">Sembunyikan nama di overlay?</Label>
                <Switch id="private-mode" checked={isPrivate} onCheckedChange={setIsPrivate} className="data-[state=checked]:bg-primary"/>
            </div>

            <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase mb-2 block">PESAN</Label>
                <Textarea 
                    placeholder="Tulis pesan dukunganmu..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="bg-muted/50 border-input min-h-[80px] rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:border-primary/50"
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
                        <span>Saldo: {balance ? parseFloat(formatUnits(balance, 18)).toLocaleString('id-ID') : '0'} IDRX</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!hasEth && <span className="text-destructive font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> No ETH Gas</span>}
                    <button 
                        onClick={logout} 
                        className="text-destructive/80 hover:text-destructive transition-colors uppercase font-bold text-[10px]"
                    >
                        Disconnect
                    </button>
                </div>
            </div>
        )}

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-[480px] pointer-events-auto bg-background/90 backdrop-blur-xl border-t border-border p-4">
                <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-lg disabled:opacity-50"
                    onClick={handleMainAction}
                    disabled={isButtonDisabled}
                >
                    {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    {!hasBalance && status !== 'APPROVE_NEEDED' && status !== 'LOGIN_NEEDED' ? 'Saldo IDRX Kurang' : getButtonText()}
                </Button>
            </div>
        </div>

        {/* Confirmation Drawer */}
        <Drawer open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DrawerContent className="bg-card border-t border-border text-foreground">
                <div className="max-w-md mx-auto w-full">
                    <DrawerHeader>
                        <DrawerTitle className="text-center text-xl">Konfirmasi Saweran</DrawerTitle>
                        <DrawerDescription className="text-center text-muted-foreground">
                            Pastikan detail di bawah ini sudah benar.
                        </DrawerDescription>
                    </DrawerHeader>
                    
                    <div className="p-4 space-y-4">
                        <div className="bg-muted/50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nominal</span>
                                <span className="font-bold text-primary">{formatRupiah(amount)} IDRX</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Streamer</span>
                                <span className="font-bold text-foreground">{streamerName}</span>
                            </div>
                            <div className="border-t border-border my-2 pt-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Dari</span>
                                    <span className="font-bold text-foreground">{isPrivate ? 'Anonymous' : (donorName || 'Someone')}</span>
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
                            Konfirmasi & Kirim
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full text-muted-foreground">Batal</Button>
                        </DrawerClose>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    </div>
  );
}
