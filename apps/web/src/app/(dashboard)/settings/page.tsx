'use client';

import Link from 'next/link';
import { Users, Shield, Briefcase, Wrench, Plug } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { canManageUsers } from '@/lib/permissions';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const showUserManagement = canManageUsers(user?.role);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          System configuration and administration
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {showUserManagement && (
          <Link href="/settings/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts and assign roles
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )}

        {showUserManagement && (
          <Link href="/integrations/hubspot">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  Integrations
                </CardTitle>
                <CardDescription>
                  Manage HubSpot sync and external integrations
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )}

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles & Permissions
            </CardTitle>
            <CardDescription>
              Configure role-based access (Coming soon)
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Practices
            </CardTitle>
            <CardDescription>
              Manage practices and teams (Coming soon)
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              System
            </CardTitle>
            <CardDescription>
              System preferences and defaults (Coming soon)
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
