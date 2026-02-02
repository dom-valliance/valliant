'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Users,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePeople } from '@/hooks/use-people';
import { useProjects } from '@/hooks/use-projects';
import { useAllocations } from '@/hooks/use-allocations';
import { AllocationDialog } from './components/allocation-dialog';
import { AIRecommendationPanel } from './components/ai-recommendation-panel';
import { ScheduleGrid } from './components/schedule-grid';

type ViewMode = 'week' | 'month';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startStr = start.toLocaleDateString('en-GB', options);
  const endStr = end.toLocaleDateString('en-GB', { ...options, year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function ScheduleClient() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState<Date>(() => getWeekStart(new Date()));
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const { data: people, isLoading: loadingPeople } = usePeople();
  const { data: projects, isLoading: loadingProjects } = useProjects();

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      const start = getWeekStart(currentDate);
      const end = addDays(start, 6);
      return { start, end };
    } else {
      const start = getMonthStart(currentDate);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      return { start, end };
    }
  }, [currentDate, viewMode]);

  const { data: allocations, isLoading: loadingAllocations } = useAllocations({
    startDate: dateRange.start.toISOString().split('T')[0],
    endDate: dateRange.end.toISOString().split('T')[0],
  });

  const isLoading = loadingPeople || loadingProjects || loadingAllocations;

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addMonths(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(viewMode === 'week' ? getWeekStart(new Date()) : getMonthStart(new Date()));
  };

  const handleCreateAllocation = (personId?: string, _date?: Date) => {
    setSelectedAllocation(null);
    setSelectedPerson(personId || null);
    setAllocationDialogOpen(true);
  };

  const handleEditAllocation = (allocationId: string) => {
    setSelectedAllocation(allocationId);
    setSelectedPerson(null);
    setAllocationDialogOpen(true);
  };

  const activePeople = people?.filter(p => p.status === 'ACTIVE') || [];
  const activeProjects = projects?.filter(p => ['ACTIVE', 'CONFIRMED', 'DISCOVERY'].includes(p.status)) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Manage resource allocations and capacity planning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setAiPanelOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Suggestions
          </Button>
          <Button onClick={() => handleCreateAllocation()}>
            <Plus className="mr-2 h-4 w-4" />
            New Allocation
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="ml-2 font-medium">
                {viewMode === 'week'
                  ? formatDateRange(dateRange.start, dateRange.end)
                  : formatMonthYear(dateRange.start)}
              </div>
            </div>

            {/* View Mode & Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">View:</span>
                <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Project:</span>
                <Select
                  value={selectedProject || 'all'}
                  onValueChange={(v) => setSelectedProject(v === 'all' ? null : v)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {activeProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total People</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{activePeople.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{activeProjects.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Allocations This Period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{allocations?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Legend</CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === 'week' ? (
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="bg-blue-500">Confirmed</Badge>
                <Badge variant="outline" className="border-dashed border-2">Tentative</Badge>
                <Badge variant="default" className="bg-amber-500">Leave</Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-4 h-4 rounded bg-blue-200" />
                  <span>&lt;30%</span>
                  <div className="w-4 h-4 rounded bg-blue-400" />
                  <span>50%</span>
                  <div className="w-4 h-4 rounded bg-blue-600" />
                  <span>90%+</span>
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span>Over</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-4 h-4 rounded bg-amber-200" />
                  <span>Leave</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 border border-yellow-600" />
                  <span>Tentative</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resource Schedule
          </CardTitle>
          <CardDescription>
            Click on a cell to create a new allocation, or click an allocation to edit it
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading schedule...</span>
            </div>
          ) : (
            <ScheduleGrid
              people={activePeople}
              allocations={allocations || []}
              dateRange={dateRange}
              viewMode={viewMode}
              selectedProject={selectedProject}
              onCellClick={handleCreateAllocation}
              onAllocationClick={handleEditAllocation}
            />
          )}
        </CardContent>
      </Card>

      {/* Allocation Dialog */}
      <AllocationDialog
        open={allocationDialogOpen}
        onOpenChange={setAllocationDialogOpen}
        allocationId={selectedAllocation}
        defaultPersonId={selectedPerson}
        people={activePeople}
        projects={activeProjects}
      />

      {/* AI Recommendations Panel */}
      <AIRecommendationPanel
        open={aiPanelOpen}
        onOpenChange={setAiPanelOpen}
        projects={activeProjects}
        onCreateAllocation={(personId) => {
          setAiPanelOpen(false);
          setSelectedPerson(personId);
          setAllocationDialogOpen(true);
        }}
      />
    </div>
  );
}
