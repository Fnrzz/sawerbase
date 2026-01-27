
import { DonationWidget } from '@/components/features/DonationWidget';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Donate to ${username} - SawerBase`,
  };
}

export default async function DonationPage({ params }: Props) {
  const { username } = await params;
  const { data: user } = await supabase
    .from('profiles')
    .select('wallet_address, username, display_name')
    .eq('username', username)
    .single();

  if (!user) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-purple-500/30">
        <main className="flex-grow flex items-center justify-center p-4">
            <DonationWidget 
                streamerAddress={user.wallet_address} 
                streamerName={user.display_name || user.username}
                streamerUsername={user.username}
            />
        </main>
    </div>
  );
}
