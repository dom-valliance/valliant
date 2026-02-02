'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  people: 'People',
  projects: 'Projects',
  clients: 'Clients',
  schedule: 'Schedule',
  time: 'Time Tracking',
  reports: 'Reports',
  ai: 'AI Assistant',
  settings: 'Settings',
  profile: 'Profile',
  new: 'New',
  edit: 'Edit',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    const isId = segment.length > 10 && !routeLabels[segment];
    const label = isId ? 'Details' : routeLabels[segment] || segment;

    return {
      label,
      href,
      isLast,
    };
  });

  return (
    <nav className="flex items-center text-sm text-muted-foreground">
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground capitalize">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className={cn(
                'hover:text-foreground transition-colors capitalize',
                crumb.isLast && 'text-foreground font-medium'
              )}
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
