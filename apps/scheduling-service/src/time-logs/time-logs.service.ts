import { Injectable } from '@nestjs/common';
import { prisma, Prisma } from '@vrm/database';
import { CreateTimeLogDto } from '@vrm/shared-types';

interface TimeLogFilters {
  personId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Simplified time logging service for value-based organization.
 * Stores weekly totals per project, not detailed daily entries.
 * Uses the TimeEntry model but treats it as weekly summaries.
 */
@Injectable()
export class TimeLogsService {
  async findAll(filters: TimeLogFilters) {
    const where: Prisma.TimeEntryWhereInput = {};

    if (filters.personId) {
      where.personId = filters.personId;
    }
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }
    if (filters.startDate) {
      where.date = { ...(where.date as any), gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      where.date = { ...(where.date as any), lte: new Date(filters.endDate) };
    }

    return prisma.timeEntry.findMany({
      where,
      include: {
        person: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
        phase: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { date: 'desc' },
        { project: { name: 'asc' } },
      ],
    });
  }

  async findOne(id: string) {
    return prisma.timeEntry.findUnique({
      where: { id },
      include: {
        person: true,
        project: {
          include: { client: true },
        },
        phase: true,
      },
    });
  }

  async getWeeklyLogs(personId: string, weekStart: string) {
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    return prisma.timeEntry.findMany({
      where: {
        personId,
        date: {
          gte: weekStartDate,
          lte: weekEndDate,
        },
      },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        phase: {
          select: { id: true, name: true },
        },
      },
      orderBy: { project: { name: 'asc' } },
    });
  }

  async prefillFromAllocations(personId: string, weekStart: string) {
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Get allocations for this week
    const allocations = await prisma.allocation.findMany({
      where: {
        personId,
        status: 'CONFIRMED',
        startDate: { lte: weekEndDate },
        endDate: { gte: weekStartDate },
      },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        phase: {
          select: { id: true, name: true },
        },
      },
    });

    // Get existing time logs for this week
    const existingLogs = await this.getWeeklyLogs(personId, weekStart);
    type LogEntry = { projectId: string | null };
    const existingProjectIds = new Set(existingLogs.map((l: LogEntry) => l.projectId));

    // Calculate suggested hours per project (business days in the overlap)
    type AllocationEntry = typeof allocations[number];
    const suggestions = allocations
      .filter((a: AllocationEntry) => !existingProjectIds.has(a.projectId))
      .map((allocation: AllocationEntry) => {
        const overlapStart = new Date(Math.max(allocation.startDate.getTime(), weekStartDate.getTime()));
        const overlapEnd = new Date(Math.min(allocation.endDate.getTime(), weekEndDate.getTime()));
        const businessDays = this.getBusinessDays(overlapStart, overlapEnd);
        const suggestedHours = businessDays * Number(allocation.hoursPerDay);

        return {
          projectId: allocation.projectId,
          project: allocation.project,
          phaseId: allocation.phaseId,
          phase: allocation.phase,
          suggestedHours,
          allocationType: allocation.allocationType,
        };
      });

    return {
      weekStart: weekStartDate.toISOString(),
      weekEnd: weekEndDate.toISOString(),
      existingLogs,
      suggestions,
    };
  }

  async create(createTimeLogDto: CreateTimeLogDto) {
    // For simplified logging, we store the week start date and treat it as a weekly entry
    const entry = await prisma.timeEntry.create({
      data: {
        personId: createTimeLogDto.personId,
        projectId: createTimeLogDto.projectId,
        phaseId: createTimeLogDto.phaseId,
        date: new Date(createTimeLogDto.weekStartDate),
        hours: createTimeLogDto.totalHours,
        entryType: 'BILLABLE', // Default, can be extended later
        description: createTimeLogDto.notes,
        status: 'APPROVED', // No approval workflow for value-based org
        createdBy: createTimeLogDto.personId, // Self-logged
      },
      include: {
        person: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
        phase: {
          select: { id: true, name: true },
        },
      },
    });

    return entry;
  }

  async createBatch(createTimeLogDtos: CreateTimeLogDto[]) {
    const entries = await Promise.all(
      createTimeLogDtos.map(dto => this.create(dto))
    );
    return entries;
  }

  async update(id: string, updateData: Partial<CreateTimeLogDto>) {
    return prisma.timeEntry.update({
      where: { id },
      data: {
        hours: updateData.totalHours,
        phaseId: updateData.phaseId,
        description: updateData.notes,
        date: updateData.weekStartDate ? new Date(updateData.weekStartDate) : undefined,
      },
      include: {
        person: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
        phase: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.timeEntry.delete({
      where: { id },
    });
  }

  async getSummary(filters: TimeLogFilters) {
    const where: Prisma.TimeEntryWhereInput = {};

    if (filters.personId) {
      where.personId = filters.personId;
    }
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }
    if (filters.startDate) {
      where.date = { ...(where.date as any), gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      where.date = { ...(where.date as any), lte: new Date(filters.endDate) };
    }

    // Aggregate hours by project
    const byProject = await prisma.timeEntry.groupBy({
      by: ['projectId'],
      where,
      _sum: {
        hours: true,
      },
    });

    // Get project details
    type ProjectGroupResult = { projectId: string | null; _sum: { hours: Prisma.Decimal | null } };
    const projectIds = byProject.map((b: ProjectGroupResult) => b.projectId).filter((id: string | null): id is string => id !== null);
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true, code: true, client: { select: { name: true } } },
    });

    // Aggregate hours by person
    const byPerson = await prisma.timeEntry.groupBy({
      by: ['personId'],
      where,
      _sum: {
        hours: true,
      },
    });

    // Get person details
    type PersonGroupResult = { personId: string; _sum: { hours: Prisma.Decimal | null } };
    const personIds = byPerson.map((b: PersonGroupResult) => b.personId);
    const people = await prisma.person.findMany({
      where: { id: { in: personIds } },
      select: { id: true, name: true },
    });

    // Total hours
    const total = await prisma.timeEntry.aggregate({
      where,
      _sum: {
        hours: true,
      },
    });

    type ProjectRecord = { id: string; name: string; code: string };
    type PersonRecord = { id: string; name: string };

    return {
      totalHours: Number(total._sum.hours) || 0,
      byProject: byProject.map((b: ProjectGroupResult) => ({
        projectId: b.projectId,
        project: projects.find((p: ProjectRecord) => p.id === b.projectId),
        hours: Number(b._sum.hours) || 0,
      })),
      byPerson: byPerson.map((b: PersonGroupResult) => ({
        personId: b.personId,
        person: people.find((p: PersonRecord) => p.id === b.personId),
        hours: Number(b._sum.hours) || 0,
      })),
    };
  }

  private getBusinessDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
}
