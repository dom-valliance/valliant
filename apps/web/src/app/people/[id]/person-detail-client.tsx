'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Mail, Calendar, TrendingUp, DollarSign, Briefcase, Award, Trash2 } from 'lucide-react';
import { usePerson, useDeletePerson } from '@/hooks/use-people';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils';

export function PersonDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: person, isLoading, error } = usePerson(id);
  const deletePerson = useDeletePerson();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading person details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Person</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Person not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/people">
              <Button variant="outline">Back to People</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/people">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to People
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{person.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {person.email}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {person.role.name}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/people/${person.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{' '}
                  <span className="font-semibold">{person.name}</span> and remove all their
                  data from the system, including allocations and time entries.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await deletePerson.mutateAsync(person.id);
                      router.push('/people');
                    } catch (err) {
                      console.error('Failed to delete person:', err);
                      // You could add a toast notification here for errors
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deletePerson.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Type</p>
              <Badge variant={person.type === 'EMPLOYEE' ? 'default' : 'secondary'}>
                {person.type}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge
                variant={
                  person.status === 'ACTIVE'
                    ? 'success'
                    : person.status === 'BENCH'
                      ? 'warning'
                      : 'outline'
                }
              >
                {person.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Seniority</p>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{person.seniority}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Start Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(person.startDate)}</span>
              </div>
            </div>
            {person.endDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">End Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(person.endDate)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Utilisation & Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Utilisation & Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Utilisation Target</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {formatPercentage(person.utilisationTarget)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Hours per Week</p>
              <span className="text-lg font-semibold">{person.defaultHoursPerWeek}h</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Daily Rate</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {formatCurrency(person.costRateCents, person.costRateCurrency)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Confidential - Role restricted</p>
            </div>
          </CardContent>
        </Card>

        {/* Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Practices</CardTitle>
            <CardDescription>Practice assignments and focus areas</CardDescription>
          </CardHeader>
          <CardContent>
            {person.practices.length > 0 ? (
              <div className="space-y-2">
                {person.practices.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span>{p.practice.name}</span>
                    {p.isPrimary && (
                      <Badge variant="default" className="ml-2">
                        Primary
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No practices assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      {person.skills && person.skills.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
            <CardDescription>Technical and domain knowledge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {person.skills.map(skill => (
                <div key={skill.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{skill.skill.name}</span>
                    <Badge
                      variant={
                        skill.proficiency === 'EXPERT'
                          ? 'default'
                          : skill.proficiency === 'PROFICIENT'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {skill.proficiency}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{skill.skill.category}</span>
                  {skill.yearsExperience && (
                    <span className="text-xs text-muted-foreground">
                      {skill.yearsExperience} years experience
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {person.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{person.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
