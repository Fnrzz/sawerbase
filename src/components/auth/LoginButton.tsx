import { usePrivy } from '@privy-io/react-auth';
import { useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';

export function LoginButton() {
  const { login, logout, authenticated, user } = usePrivy();
  const { disconnect } = useDisconnect();
  const { t } = useLanguage();

  const handleLogin = () => {
    login();
  };

  const handleLogout = async () => {
    disconnect();
    await logout();
  };

  if (!authenticated) {
    return (
      <Button onClick={handleLogin} className="font-bold">
        <Wallet className="w-4 h-4 mr-2" />
        {t('loginButton')}
      </Button>
    );
  }

  // Determine display identifier (Email or Wallet)
  const identifier = user?.email?.address || 
                     (user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'User');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-bold">
          <User className="w-4 h-4 mr-2" />
          {identifier}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user?.wallet?.address && (
           <DropdownMenuItem className="text-xs font-mono text-muted-foreground break-all" onClick={() => navigator.clipboard.writeText(user.wallet!.address)}>
             {user.wallet.address}
           </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
