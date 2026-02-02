'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarNavItemProps {
  title: string;
  href: string;
  icon: LucideIcon;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({
  title,
  href,
  icon: Icon,
  isCollapsed = false,
  onClick,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  const linkContent = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-primary/10 text-primary border-l-2 border-primary -ml-[2px] pl-[14px]'
          : 'text-muted-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
      {!isCollapsed && <span>{title}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
