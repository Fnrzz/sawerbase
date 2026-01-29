'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, Trophy, Layers } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { cn } from '@/lib/utils'; // Assuming utils exists

import { useLanguage } from '@/context/LanguageContext';

export function BottomNav() {
  const pathname = usePathname();
  const { authenticated } = usePrivy();
  const { t } = useLanguage();

  // Hide BottomNav on public donation pages (/[username]) if desired
  // Assuming usernames don't start with "dashboard" or "profile" etc.
  // A simple check: if path is exactly "/" or starts with "/dashboard" or "/profile" or "/history" show it
  // But if it is "/[username]", hide it?
  // User Requirement: "Tabs: Home (Streamer Dashboard/Login), History, Profile".
  // Let's assume this is for the App User.
  // If the user visits /[username], they are likely a donor. They shouldn't see the Streamer Nav.
  // We can hide it for paths that don't match our specific app routes.
  // App routes: /, /dashboard, /history, /profile.
  
  // Bug Fix: Hide if not authenticated (e.g. on Auth Landing)
  if (!authenticated) return null;
  
  const isAppRoute = 
    pathname === '/' || 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/history') || 
    pathname.startsWith('/profile');

  if (!isAppRoute && pathname !== '/') return null; // Simple heuristic

  const tabs = [
    { name: t('navHome'), href: '/dashboard', icon: Home, active: pathname === '/dashboard' || pathname === '/' },
    { name: t('navLeaderboard'), href: '/dashboard/leaderboard', icon: Trophy, active: pathname.startsWith('/dashboard/leaderboard') },
    { name: t('navOverlay'), href: '/dashboard/overlay', icon: Layers, active: pathname.startsWith('/dashboard/overlay') },
    { name: t('navHistory'), href: '/dashboard/history', icon: History, active: pathname.startsWith('/dashboard/history') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-[480px] pointer-events-auto">
            <nav className="flex items-center justify-around h-20 bg-background/80 backdrop-blur-xl border-t border-border pb-2 transition-colors duration-300">
            {tabs.map((tab) => (
                <Link 
                    key={tab.name} 
                    href={tab.href}
                    className={cn(
                        "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200 active:scale-95",
                        tab.active ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                >
                    <tab.icon className={cn("w-7 h-7 mb-1", tab.active && "fill-current")} />
                    <span className="text-[10px] font-medium">{tab.name}</span>
                </Link>
            ))}
            </nav>
        </div>
    </div>
  );
}
