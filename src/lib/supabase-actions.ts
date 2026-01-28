import { supabase } from './supabase';

export interface Profile {
  id: string; // uuid
  wallet_address: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  message: string;
  streamer_wallet: string;
  coin_type: string;
  status: 'completed' | 'failed';
  tx_digest?: string;
  created_at: string;
}

// --- Profiles ---

export async function getProfileByWallet(address: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('wallet_address', address)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error('Error fetching profile:', error);
  }
  return data as Profile | null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username) 
    .single();

  if (error && error.code === 'PGRST116') {
    return true;
  }

  return false;
}

export async function createProfile(address: string, username: string, displayName: string) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        wallet_address: address,
        username: username,
        display_name: displayName,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

// --- Donations ---

export async function createDonation(
  donorAddress: string,
  donorName: string,
  amount: number,
  message: string,
  streamerAddress: string,
  status: 'completed' | 'failed',
  txDigest?: string,
  coinType: string = 'IDRX'
) {
  const { data, error } = await supabase
    .from('donations')
    .insert([
      {
        donor_name: donorName || 'Anonymous', 
        amount: amount,
        message: message,
        streamer_wallet: streamerAddress,
        coin_type: coinType,
        status: status,
        tx_digest: txDigest
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Donation;
}
