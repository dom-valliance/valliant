'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Person {
  id: string;
  name: string;
  email: string;
  role?: { name: string };
  type: string;
  defaultHoursPerWeek?: number;
  utilisationTarget?: number;
}

interface Allocation {
  id: string;
  personId: string;
  projectId: string;
  project?: { name: string; code: string; color?: string };
  startDate: string;
  endDate: string;
  hoursPerDay: number;
  allocationType: string;
  status: string;
}

interface ScheduleGridProps {
  people: Person[];
  allocations: Allocation[];
  dateRange: { start: Date; end: Date };
  viewMode: 'week' | 'month';
  selectedProject: string | null;
  onCellClick: (personId: string, date: Date) => void;
  onAllocationClick: (allocationId: string) => void;
}

function getDaysArray(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDayHeader(date: Date, viewMode: 'week' | 'month'): string {
  if (viewMode === 'week') {
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
  }
  return date.getDate().toString();
}

function isFirstDayOfWeek(date: Date): boolean {
  return date.getDay() === 1; // Monday
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function dateOverlaps(
  allocationStart: Date,
  allocationEnd: Date,
  dayStart: Date,
  dayEnd: Date
): boolean {
  return allocationStart <= dayEnd && allocationEnd >= dayStart;
}

function getAllocationColor(allocationType: string, status: string, projectColor?: string): string {
  const isConfirmed = status === 'CONFIRMED';

  // For LEAVE type, always use amber
  if (allocationType === 'LEAVE') {
    return isConfirmed ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800 border-amber-300 border-dashed border-2';
  }

  // For BENCH type, always use gray
  if (allocationType === 'BENCH') {
    return isConfirmed ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-800 border-gray-300 border-dashed border-2';
  }

  // For project allocations, use the project color if available
  if (projectColor && isConfirmed) {
    return 'text-white';
  }

  // Fallback colors for non-confirmed or when no project color
  const baseColors: Record<string, string> = {
    BILLABLE: 'bg-blue-100 text-blue-800 border-blue-300 border-dashed border-2',
    NON_BILLABLE: 'bg-purple-100 text-purple-800 border-purple-300 border-dashed border-2',
    INTERNAL: 'bg-green-100 text-green-800 border-green-300 border-dashed border-2',
  };

  return baseColors[allocationType] || baseColors.BILLABLE;
}

function isLeaveDay(allocations: Allocation[]): boolean {
  return allocations.some(a => a.allocationType === 'LEAVE');
}

// Get heatmap color based on daily utilisation percentage
function getDayHeatmapColor(hours: number, capacity: number = 8): string {
  if (hours === 0) return '';
  const percentage = (hours / capacity) * 100;
  if (percentage > 100) return 'bg-red-500'; // Overallocated
  if (percentage >= 90) return 'bg-blue-600'; // Fully loaded
  if (percentage >= 70) return 'bg-blue-500';
  if (percentage >= 50) return 'bg-blue-400';
  if (percentage >= 30) return 'bg-blue-300';
  return 'bg-blue-200'; // Lightly allocated
}

function getDayHeatmapTextColor(hours: number, capacity: number = 8): string {
  if (hours === 0) return 'text-muted-foreground';
  const percentage = (hours / capacity) * 100;
  if (percentage >= 50) return 'text-white';
  return 'text-blue-900';
}

function getUtilisationColor(utilisation: number, target: number): string {
  const ratio = utilisation / target;
  if (ratio >= 1.1) return 'text-red-600'; // Over-utilised
  if (ratio >= 0.95) return 'text-green-600'; // On target
  if (ratio >= 0.7) return 'text-yellow-600'; // Slightly under
  return 'text-gray-500'; // Under-utilised
}

function getUtilisationBarColor(utilisation: number, target: number): string {
  const ratio = utilisation / target;
  if (ratio >= 1.1) return 'bg-red-500';
  if (ratio >= 0.95) return 'bg-green-500';
  if (ratio >= 0.7) return 'bg-yellow-500';
  return 'bg-gray-400';
}

export function ScheduleGrid({
  people,
  allocations,
  dateRange,
  viewMode,
  selectedProject,
  onCellClick,
  onAllocationClick,
}: ScheduleGridProps) {
  const days = useMemo(() => getDaysArray(dateRange.start, dateRange.end), [dateRange]);

  // Count working days (exclude weekends)
  const workingDays = useMemo(() => {
    return days.filter((d) => !isWeekend(d)).length;
  }, [days]);

  // Filter allocations by selected project
  const filteredAllocations = useMemo(() => {
    if (!selectedProject) return allocations;
    return allocations.filter((a) => a.projectId === selectedProject);
  }, [allocations, selectedProject]);

  // Group allocations by person (use all allocations for utilisation calculation)
  const allocationsByPerson = useMemo(() => {
    const map = new Map<string, Allocation[]>();
    allocations.forEach((allocation) => {
      const existing = map.get(allocation.personId) || [];
      existing.push(allocation);
      map.set(allocation.personId, existing);
    });
    return map;
  }, [allocations]);

  // Group filtered allocations by person (for display)
  const filteredAllocationsByPerson = useMemo(() => {
    const map = new Map<string, Allocation[]>();
    filteredAllocations.forEach((allocation) => {
      const existing = map.get(allocation.personId) || [];
      existing.push(allocation);
      map.set(allocation.personId, existing);
    });
    return map;
  }, [filteredAllocations]);

  // Calculate weekly utilisation for a person (based on all allocations, not filtered)
  const getPersonUtilisation = (personId: string, person: Person): { hours: number; capacity: number; percentage: number } => {
    const personAllocations = allocationsByPerson.get(personId) || [];
    const weeklyCapacity = Number(person.defaultHoursPerWeek) || 40;
    const dailyCapacity = weeklyCapacity / 5;

    let totalHours = 0;
    days.forEach((day) => {
      if (isWeekend(day)) return;
      personAllocations.forEach((a) => {
        const start = new Date(a.startDate);
        const end = new Date(a.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        if (dateOverlaps(start, end, day, day)) {
          totalHours += Number(a.hoursPerDay) || 0;
        }
      });
    });

    const periodCapacity = workingDays * dailyCapacity;
    const percentage = periodCapacity > 0 ? (totalHours / periodCapacity) * 100 : 0;

    return { hours: totalHours, capacity: periodCapacity, percentage };
  };

  // Get allocations for a specific person and day (filtered)
  const getAllocationsForDay = (personId: string, day: Date): Allocation[] => {
    // Skip weekends - allocations should only apply to weekdays
    if (isWeekend(day)) return [];

    const personAllocations = filteredAllocationsByPerson.get(personId) || [];
    return personAllocations.filter((a) => {
      const start = new Date(a.startDate);
      const end = new Date(a.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return dateOverlaps(start, end, day, day);
    });
  };

  // Calculate total CONFIRMED hours for a person on a day (for overallocation warning)
  const getConfirmedHoursForDay = (personId: string, day: Date): number => {
    // Skip weekends - allocations should only apply to weekdays
    if (isWeekend(day)) return 0;

    const personAllocations = allocationsByPerson.get(personId) || [];
    return personAllocations
      .filter((a) => {
        if (a.status !== 'CONFIRMED') return false;
        const start = new Date(a.startDate);
        const end = new Date(a.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return dateOverlaps(start, end, day, day);
      })
      .reduce((sum, a) => sum + (Number(a.hoursPerDay) || 0), 0);
  };

  // Calculate total hours (all allocations) for display
  const getTotalHoursForDay = (personId: string, day: Date): number => {
    // Skip weekends - allocations should only apply to weekdays
    if (isWeekend(day)) return 0;

    const personAllocations = allocationsByPerson.get(personId) || [];
    return personAllocations
      .filter((a) => {
        const start = new Date(a.startDate);
        const end = new Date(a.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return dateOverlaps(start, end, day, day);
      })
      .reduce((sum, a) => sum + (Number(a.hoursPerDay) || 0), 0);
  };

  if (people.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No active people found. Add people to start scheduling.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[800px]"
          style={{
            gridTemplateColumns: `240px repeat(${days.length}, minmax(${viewMode === 'week' ? '100px' : '40px'}, 1fr))`,
          }}
        >
          {/* Header Row */}
          <div className="sticky left-0 z-10 bg-background border-b px-4 py-2 font-medium">
            People
          </div>
          {days.map((day, idx) => (
            <div
              key={idx}
              className={cn(
                'border-b border-l px-1 py-2 text-center text-sm font-medium',
                isWeekend(day) && 'bg-muted/50',
                viewMode === 'month' && isFirstDayOfWeek(day) && idx > 0 && 'border-l-2 border-l-muted-foreground/30'
              )}
            >
              {viewMode === 'month' ? (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-muted-foreground">
                    {day.toLocaleDateString('en-GB', { weekday: 'narrow' })}
                  </span>
                  <span className="text-xs">{day.getDate()}</span>
                </div>
              ) : (
                formatDayHeader(day, viewMode)
              )}
            </div>
          ))}

          {/* Person Rows */}
          {people.map((person) => {
            const utilisation = getPersonUtilisation(person.id, person);
            const target = (Number(person.utilisationTarget) || 0.8) * 100;

            return (
              <>
                {/* Person Info Cell with Utilisation */}
                <div
                  key={`person-${person.id}`}
                  className="sticky left-0 z-10 bg-background border-b px-4 py-2 flex items-center gap-3"
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {getInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate text-sm">{person.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {person.role?.name || person.type}
                    </div>
                    {/* Utilisation Bar */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                getUtilisationBarColor(utilisation.percentage, target)
                              )}
                              style={{ width: `${Math.min(utilisation.percentage, 100)}%` }}
                            />
                          </div>
                          <span className={cn('text-xs font-medium tabular-nums', getUtilisationColor(utilisation.percentage, target))}>
                            {utilisation.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="space-y-1 text-xs">
                          <div className="font-medium">Utilisation</div>
                          <div>{utilisation.hours.toFixed(1)}h of {utilisation.capacity.toFixed(0)}h capacity</div>
                          <div>Target: {target.toFixed(0)}%</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Day Cells */}
                {days.map((day, dayIdx) => {
                  const dayAllocations = getAllocationsForDay(person.id, day);
                  const confirmedHours = getConfirmedHoursForDay(person.id, day);
                  const totalHours = getTotalHoursForDay(person.id, day);
                  // Only show overallocation warning for CONFIRMED hours > 8
                  const isOverAllocated = confirmedHours > 8;
                  const weekend = isWeekend(day);
                  const hasLeave = isLeaveDay(dayAllocations);

                  // Month view: heatmap-style compact view
                  if (viewMode === 'month') {
                    return (
                      <Tooltip key={`${person.id}-${dayIdx}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'border-b border-l min-h-[48px] cursor-pointer transition-colors relative flex items-center justify-center',
                              weekend && 'bg-muted/30',
                              hasLeave && 'bg-amber-200',
                              !weekend && !hasLeave && totalHours > 0 && getDayHeatmapColor(totalHours),
                              !weekend && totalHours === 0 && 'hover:bg-muted/30',
                              isOverAllocated && 'ring-2 ring-red-500 ring-inset',
                              isFirstDayOfWeek(day) && dayIdx > 0 && 'border-l-2 border-l-muted-foreground/30'
                            )}
                            onClick={() => {
                              if (!weekend) onCellClick(person.id, day);
                            }}
                          >
                            {hasLeave ? (
                              <span className="text-xs font-semibold text-amber-700">OFF</span>
                            ) : !weekend && totalHours > 0 ? (
                              <span className={cn(
                                'text-xs font-semibold tabular-nums',
                                getDayHeatmapTextColor(totalHours)
                              )}>
                                {totalHours}
                              </span>
                            ) : null}
                            {/* Tentative indicator dot */}
                            {dayAllocations.some(a => a.status === 'TENTATIVE' && a.allocationType !== 'LEAVE') && (
                              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-400 border border-yellow-600" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-2">
                            <div className="font-medium">
                              {day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </div>
                            {dayAllocations.length > 0 ? (
                              <div className="space-y-1">
                                {dayAllocations.map((allocation) => (
                                  <div key={allocation.id} className="flex items-center justify-between gap-3 text-xs">
                                    <span className="truncate">{allocation.project?.code || 'N/A'}</span>
                                    <span className="flex items-center gap-1">
                                      <span>{allocation.hoursPerDay}h</span>
                                      <Badge
                                        variant={allocation.status === 'CONFIRMED' ? 'default' : 'outline'}
                                        className="text-[10px] px-1 py-0"
                                      >
                                        {allocation.status === 'CONFIRMED' ? 'C' : 'T'}
                                      </Badge>
                                    </span>
                                  </div>
                                ))}
                                <div className="pt-1 border-t text-xs text-muted-foreground">
                                  Total: {totalHours}h ({confirmedHours}h confirmed)
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">No allocations</div>
                            )}
                            {isOverAllocated && (
                              <div className="text-xs text-red-600 font-medium">
                                Overallocated ({confirmedHours}h confirmed)
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  // Week view: detailed allocation cards
                  return (
                    <div
                      key={`${person.id}-${dayIdx}`}
                      className={cn(
                        'border-b border-l min-h-[60px] p-1 cursor-pointer transition-colors hover:bg-muted/30',
                        weekend && 'bg-muted/20',
                        hasLeave && 'bg-amber-50',
                        isOverAllocated && !hasLeave && 'bg-red-50'
                      )}
                      onClick={() => {
                        if (!weekend) onCellClick(person.id, day);
                      }}
                    >
                      {dayAllocations.length > 0 && (
                        <div className="space-y-1">
                          {dayAllocations.slice(0, 2).map((allocation) => {
                            const projectColor = allocation.project?.color;
                            const isConfirmed = allocation.status === 'CONFIRMED';
                            const colorClass = getAllocationColor(allocation.allocationType, allocation.status, projectColor);
                            const style = projectColor && isConfirmed ? { backgroundColor: projectColor } : undefined;

                            return (
                            <Tooltip key={allocation.id}>
                              <TooltipTrigger asChild>
                                <button
                                  className={cn(
                                    'w-full text-left px-1.5 py-0.5 rounded text-xs truncate',
                                    colorClass
                                  )}
                                  style={style}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAllocationClick(allocation.id);
                                  }}
                                >
                                  {allocation.allocationType === 'LEAVE' ? (
                                    <span className="font-medium">Leave</span>
                                  ) : (
                                    <>
                                      <span className="font-medium">{allocation.project?.code || 'N/A'}</span>
                                      <span className="ml-1 opacity-75">{allocation.hoursPerDay}h</span>
                                    </>
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {allocation.allocationType === 'LEAVE' ? 'Leave / Time Off' : allocation.project?.name || 'Unknown Project'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {allocation.hoursPerDay}h/day · {allocation.allocationType}
                                  </div>
                                  <Badge
                                    variant={allocation.status === 'CONFIRMED' ? 'default' : 'outline'}
                                    className="text-xs"
                                  >
                                    {allocation.status}
                                  </Badge>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                            );
                          })}
                          {dayAllocations.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayAllocations.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                      {isOverAllocated && !hasLeave && (
                        <div className="text-xs text-red-600 font-medium text-center mt-1">
                          {confirmedHours}h!
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
