'use client';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import { MobileNav } from './mobile-nav';
import { Breadcrumbs } from './breadcrumbs';
import { HeaderUserMenu } from './header-user-menu';

export function Header() {
  const { isCollapsed } = useSidebarStore();

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-dark-teal/30 bg-deep-navy/95 backdrop-blur-sm px-4 lg:px-6 transition-all duration-300',
        isCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      )}
    >
      <MobileNav />
      <Breadcrumbs />
      <div className="flex-1" />
      <HeaderUserMenu />
    </header>
  );
}
