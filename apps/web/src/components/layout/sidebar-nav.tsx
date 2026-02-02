'use client';

import { navigationConfig } from '@/lib/navigation';
import { SidebarNavItem } from './sidebar-nav-item';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  isCollapsed?: boolean;
  onNavClick?: () => void;
}

export function SidebarNav({ isCollapsed = false, onNavClick }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      {navigationConfig.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {sectionIndex > 0 && <Separator className="my-2" />}
          {section.title && !isCollapsed && (
            <h4 className="mb-1 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h4>
          )}
          <div className={cn('flex flex-col gap-1', section.title && !isCollapsed && 'mt-1')}>
            {section.items.map((item) => (
              <SidebarNavItem
                key={item.href}
                title={item.title}
                href={item.href}
                icon={item.icon}
                isCollapsed={isCollapsed}
                onClick={onNavClick}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
