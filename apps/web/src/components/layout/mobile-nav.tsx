'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSidebarStore } from '@/stores/sidebar-store';
import { SidebarNav } from './sidebar-nav';

export function MobileNav() {
  const { isMobileOpen, setMobileOpen } = useSidebarStore();

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0 bg-gradient-sidebar border-r border-dark-teal/30">
        <SheetHeader className="h-16 flex items-center justify-center border-b border-dark-teal/30 px-4">
          <SheetTitle className="text-lg font-bold text-light-pink">Valliance</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
          <TooltipProvider>
            <SidebarNav onNavClick={() => setMobileOpen(false)} />
          </TooltipProvider>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
