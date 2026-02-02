'use client';

import Link from 'next/link';
import { Plus, User } from 'lucide-react';
import { usePeople } from '@/hooks/use-people';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPercentage } from '@/lib/utils';

export default function PeoplePage() {
  const { data: people, isLoading, error } = usePeople();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading people...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading People</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Failed to load people'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'BENCH':
        return <Badge variant="warning">Bench</Badge>;
      case 'OFFBOARDED':
        return <Badge variant="outline">Offboarded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'EMPLOYEE' ? (
      <Badge variant="default">Employee</Badge>
    ) : (
      <Badge variant="secondary">Contractor</Badge>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">People</h1>
          <p className="text-muted-foreground">
            Manage employees and contractors across your organization
          </p>
        </div>
        <Link href="/people/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Person
          </Button>
        </Link>
      </div>

      {!people || people.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No people yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first team member</p>
            <Link href="/people/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Person
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({people.length})</CardTitle>
            <CardDescription>
              View and manage all employees and contractors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Seniority</TableHead>
                  <TableHead>Practice</TableHead>
                  <TableHead className="text-right">Utilisation Target</TableHead>
                  <TableHead>Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map(person => (
                  <TableRow key={person.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link
                        href={`/people/${person.id}`}
                        className="hover:underline flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        {person.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{person.email}</TableCell>
                    <TableCell>{person.role.name}</TableCell>
                    <TableCell>{getTypeBadge(person.type)}</TableCell>
                    <TableCell>{getStatusBadge(person.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{person.seniority}</Badge>
                    </TableCell>
                    <TableCell>
                      {person.practices.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {person.practices.map(p => (
                            <Badge key={p.id} variant={p.isPrimary ? 'default' : 'secondary'}>
                              {p.practice.name}
                              {p.isPrimary && ' (Primary)'}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No practice</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercentage(person.utilisationTarget)}
                    </TableCell>
                    <TableCell>{formatDate(person.startDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
