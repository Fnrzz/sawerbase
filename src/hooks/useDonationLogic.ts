import { useState, useMemo, useEffect } from 'react';
import { useReadContract, useDisconnect } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { parseUnits, encodeFunctionData, type Address, createPublicClient, http, createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import { SAWERBASE_ADDRESS, IDRX_ADDRESS, SAWERBASE_ABI, ERC20_ABI } from '@/constants/contracts';
import { createDonation } from '@/lib/supabase-actions'; 

export type DonationStatus = 'IDLE' | 'LOGIN_NEEDED' | 'CHECKING' | 'APPROVE_NEEDED' | 'READY_TO_DONATE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export function useDonationLogic(amount: string, streamerAddress: string) {
  const { authenticated, login, user, logout: privyLogout, ready } = usePrivy();
  const { disconnect } = useDisconnect();
  // We need wallets to sign permits
  const { wallets } = useWallets();
  const { client: smartWalletClient } = useSmartWallets();

  const smartWalletAddress = smartWalletClient?.account?.address;
  const eoaWallet = wallets.find(w => w.address === user?.wallet?.address);
  const eoaAddress = eoaWallet?.address as Address | undefined;

  const isEmailUser = user?.wallet?.connectorType === 'embedded';
  
  // Data Fetching
  const publicClient = useMemo(() => createPublicClient({ chain: baseSepolia, transport: http() }), []);

  const [status, setStatus] = useState<DonationStatus>('IDLE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hash, setHash] = useState<string | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);

  const amountBigInt = useMemo(() => {
      try {
          return amount ? parseUnits(amount, 18) : BigInt(0); // Assuming 18 decimals or fetch
      } catch {
          return BigInt(0);
      }
  }, [amount]);

  // Sync Status with Auth & Input
  useEffect(() => {
    if (ready && !authenticated) {
        setStatus('LOGIN_NEEDED');
    } else if (authenticated) {
        if (amountBigInt > BigInt(0)) {
            // Valid amount and logged in -> Ready
            setStatus('READY_TO_DONATE');
        } else {
            // Logged in but no amount -> Idle
            setStatus('IDLE');
        }
    }
  }, [ready, authenticated, amountBigInt]);

  const targetAddress = isEmailUser ? smartWalletAddress : eoaAddress;

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: IDRX_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: targetAddress ? [targetAddress] : undefined,
    query: { enabled: !!targetAddress }
  });

   // Helper: Send Sponsored Transaction using Smart Wallet
    const sendSponsoredTransaction = async (calls: { to: Address, data: `0x${string}`, value: bigint }[]) => {
        if (!smartWalletClient) throw new Error("Smart Wallet not ready");
        console.log("Submitting sponsored transaction...", calls);
        // The provider setup handles the sponsorship via /api/paymaster
        return await smartWalletClient.sendTransaction({
            account: smartWalletClient.account,
            chain: baseSepolia,
            calls: calls
        });
    };

    const donate = async (donorName: string, message: string) => {
        if (!authenticated || !user || !smartWalletClient) {
            login();
            return;
        }

        setIsProcessing(true);
        setError(null);
        setHash(undefined);

        let txHash: string | undefined;

        try {
            if (isEmailUser) {
                const approveData = encodeFunctionData({
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [SAWERBASE_ADDRESS, amountBigInt]
                });
                const donateData = encodeFunctionData({
                    abi: SAWERBASE_ABI,
                    functionName: 'donate',
                    args: [IDRX_ADDRESS, amountBigInt, streamerAddress as Address]
                });

                txHash = await sendSponsoredTransaction([
                    { to: IDRX_ADDRESS, data: approveData, value: BigInt(0) },
                    { to: SAWERBASE_ADDRESS, data: donateData, value: BigInt(0) }
                ]);

            } else {
                const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
                
                const domain = {
                    name: 'Rupiah Token',
                    version: '1',
                    chainId: baseSepolia.id,
                    verifyingContract: IDRX_ADDRESS
                };
                const types = {
                    Permit: [
                        { name: 'owner', type: 'address' },
                        { name: 'spender', type: 'address' },
                        { name: 'value', type: 'uint256' },
                        { name: 'nonce', type: 'uint256' },
                        { name: 'deadline', type: 'uint256' }
                    ]
                };

                const nonce = await publicClient.readContract({
                    address: IDRX_ADDRESS,
                    abi: ERC20_ABI,
                    functionName: 'nonces',
                    args: [eoaAddress!]
                });

                const message = {
                    owner: eoaAddress!,
                    spender: smartWalletAddress!,
                    value: amountBigInt,
                    nonce: nonce,
                    deadline: deadline
                };

                const provider = await eoaWallet?.getEthereumProvider();
                if (!provider) throw new Error("No provider for EOA");

                const walletClient = createWalletClient({
                    account: eoaAddress as Address,
                    chain: baseSepolia,
                    transport: custom(provider)
                });

                const signature = await walletClient.signTypedData({
                    account: eoaAddress as Address,
                    domain,
                    types,
                    primaryType: 'Permit',
                    message
                });
                
                const { v, r, s } = parseSignature(signature); 

                const permitData = encodeFunctionData({
                    abi: ERC20_ABI,
                    functionName: 'permit',
                    args: [eoaAddress!, smartWalletAddress!, amountBigInt, deadline, v, r, s]
                });
                
                const pullData = encodeFunctionData({
                    abi: ERC20_ABI,
                    functionName: 'transferFrom',
                    args: [eoaAddress!, smartWalletAddress!, amountBigInt]
                });
                
                const approveData = encodeFunctionData({
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [SAWERBASE_ADDRESS, amountBigInt]
                });
                
                const donateData = encodeFunctionData({
                    abi: SAWERBASE_ABI,
                    functionName: 'donate',
                    args: [IDRX_ADDRESS, amountBigInt, streamerAddress as Address]
                });

                txHash = await sendSponsoredTransaction([
                    { to: IDRX_ADDRESS, data: permitData, value: BigInt(0) },
                    { to: IDRX_ADDRESS, data: pullData, value: BigInt(0) },
                    { to: IDRX_ADDRESS, data: approveData, value: BigInt(0) },
                    { to: SAWERBASE_ADDRESS, data: donateData, value: BigInt(0) }
                ]);
            }

            if (txHash) {
                setHash(txHash);
                await createDonation(
                    targetAddress || '0x00',
                    donorName,
                    parseFloat(amount || '0'), 
                    message,
                    streamerAddress,
                    'completed',
                    txHash
                );
                setStatus('SUCCESS');
                refetchBalance();
            }

        } catch (err: unknown) {
            console.error('Donation Failed:', err);
            setError(err as Error);
            setStatus('ERROR');
            
            await createDonation(
                targetAddress || '0x00',
                donorName,
                parseFloat(amount || '0'), 
                message,
                streamerAddress,
                'failed'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    // Helper to parse signature
    function parseSignature(signature: `0x${string}`) {
        // viem has parseSignature or we do it manually
        const r = signature.slice(0, 66) as `0x${string}`;
        const s = ('0x' + signature.slice(66, 130)) as `0x${string}`;
        let v = parseInt(signature.slice(130, 132), 16);
        if (v < 27) v += 27;
        return { v, r, s };
    }

  // Derived State helpers
  const hasBalance = balance ? balance >= amountBigInt : false;
  // Skip hasEth check because we prefer sponsorship

  return {
    status,
    hasBalance,
    hasEth: true, // Mocked as true since we sponsor
    login,
    approve: () => {}, // No manual approve needed in hybrid flow
    donate,
    isProcessing,
    isConfirmed: !!hash,
    hash,
    error,
    balance,
    logout: async () => { await privyLogout(); disconnect(); }
  };
}
