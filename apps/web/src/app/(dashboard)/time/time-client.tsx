'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWeeklyTimeLogs, usePrefillTimeLogs, useCreateTimeLogsBatch } from '@/hooks/use-time-logs';
import { usePersonAllocations } from '@/hooks/use-allocations';
import { useProjects } from '@/hooks/use-projects';

// For now, we'll use a hardcoded user ID - in production this would come from auth context
const CURRENT_USER_ID = 'current-user';

interface TimeLogEntry {
  projectId: string;
  projectName: string;
  projectCode: string;
  allocatedHours: number;
  loggedHours: number;
  notes: string;
  isNew: boolean;
  existingId?: string;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

function formatWeekRange(start: Date): string {
  const end = getWeekEnd(start);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startStr = start.toLocaleDateString('en-GB', options);
  const endStr = end.toLocaleDateString('en-GB', { ...options, year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

export function TimeClient() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [entries, setEntries] = useState<TimeLogEntry[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const weekStartStr = formatDateForApi(currentWeekStart);
  const weekEndStr = formatDateForApi(getWeekEnd(currentWeekStart));

  const { data: projects } = useProjects();
  const { data: allocations } = usePersonAllocations(CURRENT_USER_ID, weekStartStr, weekEndStr);
  const { data: existingLogs, isLoading: loadingLogs } = useWeeklyTimeLogs(CURRENT_USER_ID, weekStartStr);
  const { data: _prefillData, isLoading: loadingPrefill } = usePrefillTimeLogs(CURRENT_USER_ID, weekStartStr);
  const createTimeLogsBatch = useCreateTimeLogsBatch();

  // Build entries from allocations, existing logs, and prefill data
  useEffect(() => {
    if (!projects) return;

    const projectMap = new Map(projects.map((p) => [p.id, p]));
    const newEntries: TimeLogEntry[] = [];
    const processedProjects = new Set<string>();

    // First, add entries from existing logs
    if (existingLogs && existingLogs.length > 0) {
      existingLogs.forEach((log) => {
        const project = projectMap.get(log.projectId);
        if (project) {
          newEntries.push({
            projectId: log.projectId,
            projectName: project.name,
            projectCode: project.code,
            allocatedHours: 0, // Will update below
            loggedHours: Number(log.hours),
            notes: log.description || '',
            isNew: false,
            existingId: log.id,
          });
          processedProjects.add(log.projectId);
        }
      });
    }

    // Then, add entries from allocations that don't have logs
    if (allocations && allocations.length > 0) {
      allocations.forEach((allocation: { projectId: string; hoursPerDay: number }) => {
        const project = projectMap.get(allocation.projectId);
        if (project && !processedProjects.has(allocation.projectId)) {
          // Calculate allocated hours for the week based on hoursPerDay
          const allocatedHours = Number(allocation.hoursPerDay) * 5; // 5 working days

          newEntries.push({
            projectId: allocation.projectId,
            projectName: project.name,
            projectCode: project.code,
            allocatedHours,
            loggedHours: allocatedHours, // Pre-fill with allocated hours
            notes: '',
            isNew: true,
          });
          processedProjects.add(allocation.projectId);
        }
      });
    }

    // Update allocated hours for existing entries based on allocations
    newEntries.forEach((entry) => {
      const allocation = allocations?.find((a: { projectId: string }) => a.projectId === entry.projectId);
      if (allocation) {
        entry.allocatedHours = Number(allocation.hoursPerDay) * 5;
      }
    });

    setEntries(newEntries);
    setHasChanges(false);
  }, [projects, allocations, existingLogs, currentWeekStart]);

  const handlePrevWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const handleHoursChange = (projectId: string, hours: number) => {
    setEntries(
      entries.map((e) =>
        e.projectId === projectId ? { ...e, loggedHours: hours } : e
      )
    );
    setHasChanges(true);
  };

  const handleNotesChange = (projectId: string, notes: string) => {
    setEntries(
      entries.map((e) =>
        e.projectId === projectId ? { ...e, notes } : e
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Create batch of time logs to save
    const logsToCreate = entries
      .filter((e) => e.loggedHours > 0)
      .map((e) => ({
        personId: CURRENT_USER_ID,
        projectId: e.projectId,
        weekStartDate: weekStartStr,
        totalHours: e.loggedHours,
        notes: e.notes || undefined,
      }));

    if (logsToCreate.length === 0) return;

    try {
      await createTimeLogsBatch.mutateAsync(logsToCreate);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save time logs:', error);
    }
  };

  const totalLoggedHours = entries.reduce((sum, e) => sum + e.loggedHours, 0);
  const totalAllocatedHours = entries.reduce((sum, e) => sum + e.allocatedHours, 0);
  const targetHours = 40; // Standard work week
  const progressPercent = Math.min((totalLoggedHours / targetHours) * 100, 100);

  const isLoading = loadingLogs || loadingPrefill;
  const isPastWeek = currentWeekStart < getWeekStart(new Date());
  const isFutureWeek = currentWeekStart > getWeekStart(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Logging</h1>
          <p className="text-muted-foreground mt-1">
            Log your weekly hours against projects - quick and simple
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || createTimeLogsBatch.isPending}
        >
          {createTimeLogsBatch.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All
        </Button>
      </div>

      {/* Week Navigator */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleThisWeek}>
                This Week
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="ml-4 font-medium text-lg">
                {formatWeekRange(currentWeekStart)}
              </div>
              {isPastWeek && (
                <Badge variant="secondary">Past Week</Badge>
              )}
              {isFutureWeek && (
                <Badge variant="outline">Future Week</Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{totalLoggedHours}h</span>
                {' / '}
                {targetHours}h target
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={progressPercent} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {progressPercent >= 100 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Target met</span>
                  </div>
                ) : progressPercent >= 80 ? (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Almost there</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    {targetHours - totalLoggedHours}h remaining
                  </div>
                )}
              </div>
              {totalAllocatedHours > 0 && (
                <div className="text-muted-foreground">
                  Allocated: {totalAllocatedHours}h
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entry Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
          {hasChanges && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
              Unsaved changes
            </Badge>
          )}
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading time logs...</span>
              </div>
            </CardContent>
          </Card>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No allocations for this week</p>
                <p className="text-sm mt-1">
                  You don't have any project allocations for this week.
                  Check the Schedule page to see your upcoming allocations.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry) => (
              <Card key={entry.projectId} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{entry.projectName}</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {entry.projectCode}
                        </Badge>
                        {entry.isNew && (
                          <Badge variant="secondary" className="text-xs">
                            Pre-filled
                          </Badge>
                        )}
                      </div>
                      {entry.allocatedHours > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Allocated: {entry.allocatedHours}h/week
                        </p>
                      )}
                    </div>

                    {/* Hours Input */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium whitespace-nowrap">
                          Hours:
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={entry.loggedHours}
                          onChange={(e) =>
                            handleHoursChange(entry.projectId, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-center"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium whitespace-nowrap">
                          Notes:
                        </label>
                        <Input
                          type="text"
                          placeholder="Optional"
                          value={entry.notes}
                          onChange={(e) => handleNotesChange(entry.projectId, e.target.value)}
                          className="w-48"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for this entry */}
                  {entry.allocatedHours > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>
                          {Math.round((entry.loggedHours / entry.allocatedHours) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min((entry.loggedHours / entry.allocatedHours) * 100, 100)}
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Quick Tips</p>
              <ul className="mt-1 space-y-1">
                <li>• Hours are pre-filled from your allocations - just adjust if needed</li>
                <li>• Notes are optional - use them for any context or clarification</li>
                <li>• Click "Save All" to save your entire week at once</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
