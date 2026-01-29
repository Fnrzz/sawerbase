'use client';

import { useState, useEffect } from 'react';
import { useWithdraw } from '@/hooks/useWithdraw';
import { useLanguage } from '@/context/LanguageContext';
import { formatUnits } from 'viem';
import { Loader2, ArrowUpRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface WithdrawDrawerProps {
  currentBalance: bigint;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function WithdrawDrawer({ currentBalance, onSuccess, children }: WithdrawDrawerProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  
  const { handleWithdraw, isProcessing, activeAddress, isSmartWallet } = useWithdraw(currentBalance, () => {
      setIsOpen(false);
      if (onSuccess) onSuccess();
  });

  // Helper to format currency input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow numbers and one dot
    if (/^\d*\.?\d*$/.test(val)) {
        setAmount(val);
    }
  };

  const handleSetMax = () => {
    // Format full balance to appropriate string
    const full = formatUnits(currentBalance, 18);
    setAmount(full);
  };

  const onSubmit = () => {
    if (!amount || !recipient) {
        toast.warning(t('validationStart'));
        return;
    }
    handleWithdraw(recipient, amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
            <Button size="sm" variant="outline" className="h-8 gap-1 rounded-full text-xs font-bold border-primary/20 hover:border-primary hover:text-primary transition-all">
                <ArrowUpRight className="w-3 h-3" />
                {t('withdraw')}
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('withdrawTitle')}</DialogTitle>
          <DialogDescription>
            {t('withdrawDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            {/* Source Info */}
            <div className="bg-muted/50 p-3 rounded-xl flex items-center justify-between">
                <div>
                     <Label className="text-xs text-muted-foreground uppercase">{t('sourceAddress')}</Label>
                     <div className="flex items-center gap-2 mt-1">
                        <Wallet className="w-4 h-4 text-primary" />
                        <span className="font-mono text-sm font-bold">
                            {activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : '...'}
                        </span>
                     </div>
                </div>
                <Badge variant={isSmartWallet ? "default" : "secondary"} className="text-[10px]">
                    {isSmartWallet ? t('smartWallet') : t('eoaWallet')}
                </Badge>
            </div>

            {/* Recipient Input */}
            <div className="space-y-2">
                <Label htmlFor="recipient">{t('recipientAddress')}</Label>
                <Input 
                    id="recipient" 
                    placeholder={t('recipientPlaceholder')} 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="font-mono text-sm"
                />
                <p className="text-[10px] text-yellow-600 dark:text-yellow-500 font-medium flex items-center gap-1">
                    ⚠️ {t('networkWarning')}
                </p>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
                 <div className="flex justify-between">
                    <Label htmlFor="amount">{t('amount')}</Label>
                    <span className="text-xs text-muted-foreground">
                        {t('balance')}: {parseFloat(formatUnits(currentBalance, 18)).toLocaleString('id-ID')} IDRX
                    </span>
                 </div>
                 <div className="relative">
                    <Input 
                        id="amount" 
                        placeholder="0.0" 
                        value={amount}
                        onChange={handleAmountChange}
                        className="pr-16 text-lg font-bold"
                    />
                    <div className="absolute right-2 top-1.5 flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">IDRX</span>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 px-2 text-[10px] font-bold"
                            onClick={handleSetMax}
                        >
                            {t('max')}
                        </Button>
                    </div>
                 </div>
            </div>
        </div>

        <DialogFooter>
           <Button onClick={onSubmit} disabled={isProcessing} className="w-full font-bold">
               {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
               {isProcessing ? t('processingWithdraw') : t('withdrawAction')}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
