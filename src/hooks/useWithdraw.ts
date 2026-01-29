import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { isAddress, parseUnits, encodeFunctionData } from 'viem';
import { IDRX_ADDRESS, ERC20_ABI } from '@/constants/contracts';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export function useWithdraw(maxBalance: bigint, onSuccess?: () => void) {
  const { user, authenticated } = usePrivy();
  const { client: smartWalletClient } = useSmartWallets();
  const { t } = useLanguage();

  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Wagmi Hook for EOA
  const { writeContractAsync } = useWriteContract();

  // Determine Source
  // If embedded wallet, we treat as Smart Wallet user (since we use Privy embedded for SW)
  const isEmailUser = user?.wallet?.connectorType === 'embedded';
  const smartWalletAddress = smartWalletClient?.account?.address;
  const activeAddress = isEmailUser ? smartWalletAddress : user?.wallet?.address;

  // Use this to track EOA tx status if needed, but we used async write so we can await it
  const { isSuccess: isEoaSuccess, isLoading: isEoaLoading } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleWithdraw = async (recipient: string, amount: string) => {
    if (!authenticated || !activeAddress) return;

    // 1. Validation
    if (!isAddress(recipient)) {
        toast.error(t('invalidAddress'));
        return;
    }

    const amountBi = parseUnits(amount, 18); // IDRX has 18 decimals
    if (amountBi <= 0n) {
        toast.error(t('zeroAmount'));
        return;
    }
    if (amountBi > maxBalance) {
        toast.error(t('insufficientFunds'));
        return;
    }

    setIsProcessing(true);
    const toastId = toast.loading(t('processingWithdraw'));

    try {
        if (isEmailUser) {
            // --- SCENARIO A: SMART WALLET (Gasless) ---
            if (!smartWalletClient) throw new Error("Smart Wallet not ready");

            // Encode ERC20 transfer data
            const calldata = encodeFunctionData({
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [recipient, amountBi]
            });

            // Send Transaction via Bundler/Paymaster
            const txHash = await smartWalletClient.sendTransaction({
                to: IDRX_ADDRESS,
                data: calldata,
                value: 0n,
            });

            console.log("Smart Wallet Withdraw Hash:", txHash);
            
            // For Smart Wallets, we might want to wait for receipt manually or just assume submission is good enough for MVP UI
            // But let's verify quickly if possible. smartWalletClient usually returns hash. 
            // We can treat submission as success for UI feedback.
            toast.success(t('withdrawSuccess'), { id: toastId });
            if (onSuccess) onSuccess();

        } else {
            // --- SCENARIO B: EOA (User Pays Gas) ---
            const hash = await writeContractAsync({
                address: IDRX_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [recipient, amountBi],
            });
            
            setTxHash(hash);
            console.log("EOA Withdraw Hash:", hash);
            toast.success(t('withdrawSuccess'), { id: toastId });
            if (onSuccess) onSuccess();
        }

    } catch (error) {
        console.error("Withdraw Error:", error);
        toast.error(error instanceof Error ? error.message : 'Detailed error check console', { id: toastId });
    } finally {
        setIsProcessing(false);
    }
  };

  return {
    handleWithdraw,
    isProcessing: isProcessing || isEoaLoading,
    activeAddress,
    isSmartWallet: isEmailUser
  };
}
