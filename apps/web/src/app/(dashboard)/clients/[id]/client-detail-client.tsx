'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Mail, Building2, FolderKanban, Trash2 } from 'lucide-react';
import { useClient, useDeleteClient } from '@/hooks/use-clients';
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">Active</Badge>;
    case 'CONFIRMED':
      return <Badge variant="success">Confirmed</Badge>;
    case 'PROSPECT':
      return <Badge variant="warning">Prospect</Badge>;
    case 'DISCOVERY':
      return <Badge variant="warning">Discovery</Badge>;
    case 'ON_HOLD':
      return <Badge variant="warning">On Hold</Badge>;
    case 'COMPLETED':
      return <Badge variant="secondary">Completed</Badge>;
    case 'CANCELLED':
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export function ClientDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: client, isLoading, error } = useClient(id);
  const deleteClient = useDeleteClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading client details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Client</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Client not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/clients">
              <Button variant="outline">Back to Clients</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const projectCount = client._count?.projects ?? client.projects?.length ?? 0;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{client.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            {client.industry && (
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {client.industry}
              </span>
            )}
            {client.contactEmail && (
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {client.contactEmail}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${client.id}/edit`}>
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
                  <span className="font-semibold">{client.name}</span> and remove all their
                  data from the system.
                  {projectCount > 0 && (
                    <span className="block mt-2 text-destructive font-medium">
                      Warning: This client has {projectCount} project(s) that will also be affected.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await deleteClient.mutateAsync(client.id);
                      router.push('/clients');
                    } catch (err) {
                      console.error('Failed to delete client:', err);
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteClient.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Industry</p>
              {client.industry ? (
                <Badge variant="outline">{client.industry}</Badge>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Primary Contact</p>
              <span>{client.primaryContact || 'Not specified'}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Contact Email</p>
              {client.contactEmail ? (
                <a
                  href={`mailto:${client.contactEmail}`}
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  {client.contactEmail}
                </a>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Projects</CardTitle>
            <CardDescription>
              {projectCount} project{projectCount !== 1 ? 's' : ''} with this client
            </CardDescription>
          </CardHeader>
          <CardContent>
            {client.projects && client.projects.length > 0 ? (
              <div className="space-y-3">
                {client.projects.map(project => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{project.name}</span>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{project.code}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FolderKanban className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-3">No projects yet</p>
                <Link href={`/projects/new?clientId=${client.id}`}>
                  <Button variant="outline" size="sm">
                    Create Project
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {client.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
