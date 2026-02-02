'use client';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AuthProvider } from '@/components/auth/auth-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-dark">
        <Sidebar />
        <Header />
        <main
          className={cn(
            'transition-all duration-300 p-6',
            isCollapsed ? 'lg:ml-16' : 'lg:ml-60'
          )}
        >
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
