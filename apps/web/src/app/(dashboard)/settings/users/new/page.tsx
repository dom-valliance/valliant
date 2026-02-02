'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCreateUser } from '@/hooks/use-users';
import { usePeople } from '@/hooks/use-people';
import { useAuthStore } from '@/stores/auth-store';
import { canManageUsers, UserRole } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const roles = [
  { value: UserRole.PARTNER, label: 'Partner' },
  { value: UserRole.OPS_LEAD, label: 'Operations Lead' },
  { value: UserRole.PRACTICE_LEAD, label: 'Practice Lead' },
  { value: UserRole.PROJECT_MANAGER, label: 'Project Manager' },
  { value: UserRole.TEAM_MEMBER, label: 'Team Member' },
  { value: UserRole.CONTRACTOR, label: 'Contractor' },
  { value: UserRole.READ_ONLY, label: 'Read Only' },
];

export default function NewUserPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const createUser = useCreateUser();
  const { data: people } = usePeople();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('');
  const [personId, setPersonId] = useState<string>('');
  const [error, setError] = useState('');

  if (!canManageUsers(currentUser?.role)) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-1">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !role) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await createUser.mutateAsync({
        email,
        password,
        role,
        personId: personId || undefined,
      });
      router.push('/settings/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/settings/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New User</h1>
          <p className="text-muted-foreground mt-1">Create a new user account</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Enter the details for the new user</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@valliance.ai"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="person">Link to Person (Optional)</Label>
              <Select value={personId || 'none'} onValueChange={(value) => setPersonId(value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {people?.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} ({person.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Link this user account to a person in the system
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? 'Creating...' : 'Create User'}
              </Button>
              <Link href="/settings/users">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
