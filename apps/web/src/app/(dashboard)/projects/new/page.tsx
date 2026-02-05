'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useCreateProject } from '@/hooks/use-projects';
import { useClients } from '@/hooks/use-clients';
import { usePractices } from '@/hooks/use-practices';
import { usePeople } from '@/hooks/use-people';
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
import {
  CommercialModel,
  ProjectType,
  TeamModel,
  ProjectStatus,
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  TEAM_MODEL_OPTIONS,
  COMMERCIAL_MODEL_OPTIONS,
  PROJECT_COLORS,
  getNextAvailableProjectColor,
} from '@/lib/constants';
import { useProjects } from '@/hooks/use-projects';

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId') || '';

  const createProject = useCreateProject();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: practices, isLoading: practicesLoading } = usePractices();
  const { data: people, isLoading: peopleLoading } = usePeople();
  const { data: existingProjects } = useProjects();

  // Get the next available color based on existing projects
  const usedColors = existingProjects?.map(p => p.color) || [];
  const defaultColor = getNextAvailableProjectColor(usedColors);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    clientId: preselectedClientId,
    primaryPracticeId: '',
    valuePartnerId: '',
    status: 'PROSPECT' as ProjectStatus,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    projectType: 'PILOT' as ProjectType,
    teamModel: 'THREE_IN_BOX' as TeamModel,
    commercialModel: 'VALUE_SHARE' as CommercialModel,
    estimatedValueCents: '',
    valueSharePct: '0.15',
    agreedFeeCents: '',
    contingencyPct: '0.20',
    color: defaultColor,
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Filter people to only show partners for value partner selection
  const partners = people?.filter(p => p.seniority === 'PARTNER' || p.seniority === 'PRINCIPAL') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.code || !formData.clientId || !formData.primaryPracticeId || !formData.valuePartnerId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Build the payload based on commercial model
      const payload: Parameters<typeof createProject.mutateAsync>[0] = {
        name: formData.name,
        code: formData.code,
        clientId: formData.clientId,
        primaryPracticeId: formData.primaryPracticeId,
        valuePartnerId: formData.valuePartnerId,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        projectType: formData.projectType,
        teamModel: formData.teamModel,
        commercialModel: formData.commercialModel,
        contingencyPct: parseFloat(formData.contingencyPct) || 0.2,
        color: formData.color,
        notes: formData.notes || undefined,
      };

      // Add commercial model specific fields
      if (formData.commercialModel === 'VALUE_SHARE' || formData.commercialModel === 'HYBRID') {
        if (formData.estimatedValueCents) {
          payload.estimatedValueCents = formData.estimatedValueCents;
        }
        if (formData.valueSharePct) {
          payload.valueSharePct = parseFloat(formData.valueSharePct);
        }
      }

      if (formData.commercialModel === 'FIXED_PRICE' || formData.commercialModel === 'HYBRID') {
        if (formData.agreedFeeCents) {
          payload.agreedFeeCents = formData.agreedFeeCents;
        }
      }

      await createProject.mutateAsync(payload);
      router.push('/projects');
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const isLoading = clientsLoading || practicesLoading || peopleLoading;

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Project</h1>
        <p className="text-muted-foreground">Set up a new client engagement</p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Project identification and client details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="AI Transformation Programme"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Project Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="UBS-2025-001"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Unique identifier for this project</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={value => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Practice assignment and team structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="practice">Primary Practice *</Label>
                  <Select
                    value={formData.primaryPracticeId}
                    onValueChange={value => setFormData({ ...formData, primaryPracticeId: value })}
                  >
                    <SelectTrigger id="practice">
                      <SelectValue placeholder="Select a practice" />
                    </SelectTrigger>
                    <SelectContent>
                      {practices?.map(practice => (
                        <SelectItem key={practice.id} value={practice.id}>
                          {practice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valuePartner">Value Partner *</Label>
                  <Select
                    value={formData.valuePartnerId}
                    onValueChange={value => setFormData({ ...formData, valuePartnerId: value })}
                  >
                    <SelectTrigger id="valuePartner">
                      <SelectValue placeholder="Select value partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.length > 0 ? (
                        partners.map(person => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name} ({person.seniority})
                          </SelectItem>
                        ))
                      ) : (
                        people?.map(person => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name} ({person.seniority})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Owns margin attribution for this project</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(value: ProjectType) => setFormData({ ...formData, projectType: value })}
                  >
                    <SelectTrigger id="projectType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamModel">Team Model</Label>
                  <Select
                    value={formData.teamModel}
                    onValueChange={(value: TeamModel) => setFormData({ ...formData, teamModel: value })}
                  >
                    <SelectTrigger id="teamModel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_MODEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    3-in-the-Box requires Consultant, Engineer, and Orchestrator
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Project Color</Label>
                <div className="flex gap-3 flex-wrap">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`
                        w-10 h-10 rounded-md border-2 transition-all
                        ${formData.color === color.value
                          ? 'border-foreground scale-110'
                          : 'border-muted hover:border-muted-foreground hover:scale-105'
                        }
                      `}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    >
                      {formData.color === color.value && (
                        <span className="text-white text-xl">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  This color will be used in the schedule view to identify this project
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Commercial Model */}
          <Card>
            <CardHeader>
              <CardTitle>Commercial Model</CardTitle>
              <CardDescription>Value-based pricing and fee structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="commercialModel">Model Type *</Label>
                <Select
                  value={formData.commercialModel}
                  onValueChange={(value: CommercialModel) => setFormData({ ...formData, commercialModel: value })}
                >
                  <SelectTrigger id="commercialModel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMERCIAL_MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value Share Fields */}
              {(formData.commercialModel === 'VALUE_SHARE' || formData.commercialModel === 'HYBRID') && (
                <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                  <h4 className="font-medium">Value Share Details</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedValue">Estimated Value Created (pence)</Label>
                      <Input
                        id="estimatedValue"
                        type="number"
                        value={formData.estimatedValueCents}
                        onChange={e => setFormData({ ...formData, estimatedValueCents: e.target.value })}
                        placeholder="100000000"
                      />
                      {formData.estimatedValueCents && (
                        <p className="text-xs text-muted-foreground">
                          £{(parseInt(formData.estimatedValueCents) / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valueSharePct">Value Share % (decimal)</Label>
                      <Input
                        id="valueSharePct"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={formData.valueSharePct}
                        onChange={e => setFormData({ ...formData, valueSharePct: e.target.value })}
                        placeholder="0.15"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.valueSharePct ? `${(parseFloat(formData.valueSharePct) * 100).toFixed(0)}%` : '0%'} of value
                      </p>
                    </div>
                  </div>

                  {formData.estimatedValueCents && formData.valueSharePct && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">Implied Revenue</p>
                      <p className="text-xl font-bold text-green-600">
                        £{((parseInt(formData.estimatedValueCents) * parseFloat(formData.valueSharePct)) / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Fixed Price Fields */}
              {(formData.commercialModel === 'FIXED_PRICE' || formData.commercialModel === 'HYBRID') && (
                <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                  <h4 className="font-medium">Fixed Price Details</h4>
                  <div className="space-y-2">
                    <Label htmlFor="agreedFee">Agreed Fee (pence)</Label>
                    <Input
                      id="agreedFee"
                      type="number"
                      value={formData.agreedFeeCents}
                      onChange={e => setFormData({ ...formData, agreedFeeCents: e.target.value })}
                      placeholder="5000000"
                    />
                    {formData.agreedFeeCents && (
                      <p className="text-xs text-muted-foreground">
                        £{(parseInt(formData.agreedFeeCents) / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="contingencyPct">Contingency % (decimal)</Label>
                <Input
                  id="contingencyPct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.contingencyPct}
                  onChange={e => setFormData({ ...formData, contingencyPct: e.target.value })}
                  placeholder="0.20"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.contingencyPct ? `${(parseFloat(formData.contingencyPct) * 100).toFixed(0)}%` : '0%'} buffer on cost estimates
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional information about this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <textarea
                  id="notes"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes, context, or requirements..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={createProject.isPending || isLoading}>
              {createProject.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
            <Link href="/projects">
              <Button type="button" variant="outline" disabled={createProject.isPending}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
