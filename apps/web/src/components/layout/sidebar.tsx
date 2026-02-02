'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSidebarStore } from '@/stores/sidebar-store';
import { SidebarNav } from './sidebar-nav';

export function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebarStore();

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-screen border-r border-dark-teal/30 bg-gradient-sidebar transition-all duration-300 hidden lg:flex flex-col',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b px-4',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && (
            <span className="text-lg font-bold text-light-pink">Valliance</span>
          )}
          {isCollapsed && (
            <span className="text-lg font-bold text-light-pink">V</span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <SidebarNav isCollapsed={isCollapsed} />
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={toggleCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
