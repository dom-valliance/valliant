'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { usePerson, useUpdatePerson } from '@/hooks/use-people';
import { useRoles } from '@/hooks/use-roles';
import { usePractices } from '@/hooks/use-practices';
import { PersonType, Seniority } from '@vrm/shared-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function EditPersonClient({ personId }: { personId: string }) {
  const router = useRouter();
  const { data: person, isLoading: personLoading } = usePerson(personId);
  const updatePerson = useUpdatePerson();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: practices, isLoading: practicesLoading } = usePractices();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: PersonType.EMPLOYEE as PersonType,
    roleId: '',
    seniority: Seniority.MID as Seniority,
    costRateCents: 70000,
    utilisationTarget: 0.8,
    defaultHoursPerWeek: 40,
    startDate: new Date().toISOString().split('T')[0],
    practiceIds: [] as string[],
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Populate form when person data loads
  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name,
        email: person.email,
        type: person.type as PersonType,
        roleId: person.role?.id || '',
        seniority: (person.seniority as Seniority) || Seniority.MID,
        costRateCents: person.costRateCents,
        utilisationTarget: Number(person.utilisationTarget),
        defaultHoursPerWeek: Number(person.defaultHoursPerWeek),
        startDate: person.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        practiceIds: person.practices?.map(p => p.practice.id) || [],
        notes: person.notes || '',
      });
    }
  }, [person]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.email || !formData.roleId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await updatePerson.mutateAsync({
        id: personId,
        data: {
          name: formData.name,
          email: formData.email,
          type: formData.type,
          roleId: formData.roleId,
          seniority: formData.seniority,
          costRateCents: formData.costRateCents,
          utilisationTarget: formData.utilisationTarget,
          defaultHoursPerWeek: formData.defaultHoursPerWeek,
          startDate: formData.startDate,
          practiceIds: formData.practiceIds,
          notes: formData.notes || undefined,
        },
      });

      router.push(`/people/${personId}`);
    } catch (err) {
      console.error('Failed to update person:', err);
      setError(err instanceof Error ? err.message : 'Failed to update person');
    }
  };

  const togglePractice = (practiceId: string) => {
    setFormData(prev => ({
      ...prev,
      practiceIds: prev.practiceIds.includes(practiceId)
        ? prev.practiceIds.filter(id => id !== practiceId)
        : [...prev.practiceIds, practiceId],
    }));
  };

  const isLoading = personLoading || rolesLoading || practicesLoading;

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/people/${personId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Person
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Person</h1>
        <p className="text-muted-foreground">Update employee or contractor profile</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading form options...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the person's core details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@valliance.ai"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, type: value as PersonType })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PersonType.EMPLOYEE}>Employee</SelectItem>
                      <SelectItem value={PersonType.CONTRACTOR}>Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.roleId}
                    onValueChange={value => setFormData({ ...formData, roleId: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seniority">Seniority *</Label>
                <Select
                  key={`seniority-${person?.id || 'new'}`}
                  value={formData.seniority}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, seniority: value as Seniority })
                  }
                >
                  <SelectTrigger id="seniority">
                    <SelectValue placeholder="Select seniority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Seniority.JUNIOR}>Junior</SelectItem>
                    <SelectItem value={Seniority.MID}>Mid</SelectItem>
                    <SelectItem value={Seniority.SENIOR}>Senior</SelectItem>
                    <SelectItem value={Seniority.PRINCIPAL}>Principal</SelectItem>
                    <SelectItem value={Seniority.PARTNER}>Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Practices</Label>
                <div className="grid gap-2">
                  {practices?.map(practice => (
                    <label
                      key={practice.id}
                      className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={formData.practiceIds.includes(practice.id)}
                        onChange={() => togglePractice(practice.id)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{practice.name}</p>
                        {practice.description && (
                          <p className="text-sm text-muted-foreground">{practice.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="costRate">Daily Cost Rate (pence) *</Label>
                  <Input
                    id="costRate"
                    type="number"
                    value={formData.costRateCents}
                    onChange={e =>
                      setFormData({ ...formData, costRateCents: parseInt(e.target.value) || 0 })
                    }
                    placeholder="70000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    £{(formData.costRateCents / 100).toFixed(2)} per day
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utilisationTarget">Utilisation Target *</Label>
                  <Input
                    id="utilisationTarget"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.utilisationTarget}
                    onChange={e =>
                      setFormData({ ...formData, utilisationTarget: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {(formData.utilisationTarget * 100).toFixed(0)}% target
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hoursPerWeek">Hours per Week *</Label>
                  <Input
                    id="hoursPerWeek"
                    type="number"
                    value={formData.defaultHoursPerWeek}
                    onChange={e =>
                      setFormData({ ...formData, defaultHoursPerWeek: parseInt(e.target.value) || 40 })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-4">
            <Button type="submit" disabled={updatePerson.isPending || isLoading}>
              {updatePerson.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Person
                </>
              )}
            </Button>
            <Link href={`/people/${personId}`}>
              <Button type="button" variant="outline" disabled={updatePerson.isPending}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
