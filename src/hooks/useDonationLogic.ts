import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance, useSwitchChain, useDisconnect } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { parseUnits, type Address, maxUint256 } from 'viem';
import { SAWERBASE_ADDRESS, IDRX_ADDRESS, SAWERBASE_ABI, ERC20_ABI } from '@/constants/contracts';

export type DonationStatus = 'IDLE' | 'LOGIN_NEEDED' | 'CHECKING' | 'APPROVE_NEEDED' | 'READY_TO_DONATE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export function useDonationLogic(amount: string, streamerAddress: string) {
  const { authenticated, login, user, logout: privyLogout } = usePrivy();
  const { disconnect } = useDisconnect();
  const account = useAccount(); // Wagmi account
  const wagmiAddress = account.address;
  // Prioritize Privy wallet address if authenticated, especially for embedded wallets
  const address = (user?.wallet?.address as Address | undefined) || wagmiAddress;
  
  const logout = async () => {
      await privyLogout();
      disconnect();
  };
  
  const [status, setStatus] = useState<DonationStatus>('IDLE');
  
  // Wagmi Hooks
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = account.chainId !== 84532;

  // Auto-Switch Network on Login
  useEffect(() => {
    if (authenticated && isWrongNetwork) {
        switchChain({ chainId: 84532 });
    }
  }, [authenticated, isWrongNetwork, switchChain]);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // ... (Reading Contracts) ...
  // Check ETH Balance for Gas
  const { data: ethBalance } = useBalance({
      address: address,
      query: { enabled: !!address }
  });

  // Read IDRX Balance
  const { data: balance } = useReadContract({
    address: IDRX_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: IDRX_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, SAWERBASE_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Read Token Decimals
  const { data: decimals } = useReadContract({
    address: IDRX_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: { staleTime: Infinity }, // Decimals rarely change
  });

  // Derived State
  const amountBigInt = useMemo(() => {
    try {
      const decimalsToUse = decimals ?? 18; // Fallback to 18 while loading
      return amount ? parseUnits(amount, decimalsToUse) : BigInt(0);
    } catch {
      return BigInt(0);
    }
  }, [amount, decimals]);

  const hasBalance = useMemo(() => {
    if (balance === undefined) return false;
    return balance >= amountBigInt;
  }, [balance, amountBigInt]);

  const isApproved = useMemo(() => {
    if (allowance === undefined) return false;
    return allowance >= amountBigInt;
  }, [allowance, amountBigInt]);

  const hasEth = useMemo(() => {
      return ethBalance ? ethBalance.value > BigInt(0) : false;
  }, [ethBalance]);

  // Status Management
  useEffect(() => {
    if (!authenticated) {
      setStatus('LOGIN_NEEDED');
      return;
    }

    if (isWritePending || isConfirming) {
      setStatus('PROCESSING');
      return;
    }
    
    // If not processing, check approved state
    if (amountBigInt > BigInt(0)) {
       if (!isApproved) {
         setStatus('APPROVE_NEEDED');
       } else {
         setStatus('READY_TO_DONATE');
       }
    } else {
        setStatus('IDLE');
    }
    
  }, [authenticated, isWritePending, isConfirming, isApproved, amountBigInt, account.chainId]);

  // Effect for Transaction Success
  useEffect(() => {
    if (isConfirmed && hash) {
      refetchAllowance().then(() => {
          // allowance updated
      });
    }
  }, [isConfirmed, hash, refetchAllowance]);


  const approve = () => {
    if (!address) return;
    // Infinite Approval Strategy
    // We approve the maximum possible amount so the user doesn't have to approve again for future donations.
    writeContract({
      address: IDRX_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [SAWERBASE_ADDRESS, maxUint256],
    });
  };

  const donate = () => {
    if (!address) return;

    // --- FORENSIC LOGGING ---
    console.log('[DEBUG] Donating...');
    console.log('[DEBUG] Token:', IDRX_ADDRESS);
    console.log('[DEBUG] Amount (wei):', amountBigInt.toString());
    console.log('[DEBUG] Streamer:', streamerAddress);
    
    // Fee Simulation (10%)
    const fee = (amountBigInt * BigInt(10)) / BigInt(100);
    const net = amountBigInt - fee;
    console.log('[DEBUG] Simulated Fee:', fee.toString());
    console.log('[DEBUG] Simulated Net:', net.toString());
    // ------------------------

    writeContract({
      address: SAWERBASE_ADDRESS,
      abi: SAWERBASE_ABI,
      functionName: 'donate',
      args: [IDRX_ADDRESS, amountBigInt, streamerAddress as Address],
    });
  };



  return {
    status,
    hasBalance,
    hasEth,
    login,
    approve,
    donate,
    isProcessing: isWritePending || isConfirming,
    isConfirmed,
    hash,
    error: writeError,
    balance,
    logout,
  };
}
