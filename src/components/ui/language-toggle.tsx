'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
                <Globe className="w-4 h-4" />
                <span className="sr-only">Toggle language</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('id')} className={cn(language === 'id' && "bg-accent")}>
                🇮🇩 Indonesia
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('en')} className={cn(language === 'en' && "bg-accent")}>
                🇺🇸 English
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
