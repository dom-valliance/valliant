import { Injectable } from '@nestjs/common';
import { PrismaClient, PersonStatus, AllocationStatus } from '@prisma/client';
import {
  AvailabilityQueryDto,
  PersonAvailability,
  CapacityForecast,
} from './dto/availability.dto';

@Injectable()
export class AvailabilityService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAvailability(query: AvailabilityQueryDto): Promise<PersonAvailability[]> {
    const { startDate, endDate } = this.getDateRange(query);

    const people = await this.prisma.person.findMany({
      where: {
        status: PersonStatus.ACTIVE,
        ...(query.roleId && { roleId: query.roleId }),
        ...(query.practiceId && {
          practices: { some: { practiceId: query.practiceId } },
        }),
        ...(query.skillIds?.length && {
          skills: { some: { skillId: { in: query.skillIds } } },
        }),
      },
      include: {
        role: true,
        practices: {
          include: { practice: true },
          where: { isPrimary: true },
        },
        skills: { include: { skill: true } },
        allocations: {
          where: {
            status: AllocationStatus.CONFIRMED,
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
          include: { project: true },
        },
      },
    });

    const workingDays = this.getWorkingDaysBetween(startDate, endDate);

    const results = people.map((person) => {
      const hoursPerDay = Number(person.defaultHoursPerWeek) / 5;
      const totalCapacity = workingDays * hoursPerDay;

      const allocatedHours = person.allocations.reduce((sum, a) => {
        const allocStart = new Date(Math.max(a.startDate.getTime(), startDate.getTime()));
        const allocEnd = new Date(Math.min(a.endDate.getTime(), endDate.getTime()));
        const days = this.getWorkingDaysBetween(allocStart, allocEnd);
        return sum + days * Number(a.hoursPerDay);
      }, 0);

      const availableHours = Math.max(0, totalCapacity - allocatedHours);

      return {
        personId: person.id,
        personName: person.name,
        personType: person.type,
        role: person.role.name,
        practice: person.practices[0]?.practice.name || null,
        skills: person.skills.map((s) => s.skill.name),
        totalCapacity,
        allocatedHours,
        availableHours,
        availabilityPct: totalCapacity > 0 ? availableHours / totalCapacity : 0,
        costRateCents: person.costRateCents,
        allocations: person.allocations
          .filter((a) => a.project !== null)
          .map((a) => ({
            projectName: a.project!.name,
            hoursPerDay: Number(a.hoursPerDay),
            startDate: a.startDate.toISOString().split('T')[0],
            endDate: a.endDate.toISOString().split('T')[0],
          })),
      };
    });

    // Filter by minimum hours if specified
    const minHours = query.minHours;
    const filtered = minHours !== undefined
      ? results.filter((p) => p.availableHours >= minHours)
      : results;

    // Sort by availability (most available first)
    return filtered.sort((a, b) => b.availableHours - a.availableHours);
  }

  async getCapacityForecast(weeksAhead: number = 12): Promise<CapacityForecast[]> {
    const now = new Date();
    const forecasts: CapacityForecast[] = [];

    // Get all active people with their practices
    const people = await this.prisma.person.findMany({
      where: { status: PersonStatus.ACTIVE },
      include: {
        practices: {
          include: { practice: true },
          where: { isPrimary: true },
        },
        allocations: {
          where: {
            status: AllocationStatus.CONFIRMED,
            endDate: { gte: now },
          },
        },
      },
    });

    for (let week = 0; week < weeksAhead; week++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + week * 7 - now.getDay() + 1); // Monday of the week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // Friday

      const workingDays = 5;
      const byPractice: Record<string, { capacity: number; allocated: number; available: number }> = {};

      let totalCapacity = 0;
      let totalAllocated = 0;

      for (const person of people) {
        const hoursPerDay = Number(person.defaultHoursPerWeek) / 5;
        const personCapacity = workingDays * hoursPerDay;
        totalCapacity += personCapacity;

        const personAllocated = person.allocations.reduce((sum, a) => {
          if (a.startDate <= weekEnd && a.endDate >= weekStart) {
            const allocStart = new Date(Math.max(a.startDate.getTime(), weekStart.getTime()));
            const allocEnd = new Date(Math.min(a.endDate.getTime(), weekEnd.getTime()));
            const days = this.getWorkingDaysBetween(allocStart, allocEnd);
            return sum + days * Number(a.hoursPerDay);
          }
          return sum;
        }, 0);
        totalAllocated += personAllocated;

        // Track by practice
        const practiceName = person.practices[0]?.practice.name || 'Unassigned';
        if (!byPractice[practiceName]) {
          byPractice[practiceName] = { capacity: 0, allocated: 0, available: 0 };
        }
        byPractice[practiceName].capacity += personCapacity;
        byPractice[practiceName].allocated += personAllocated;
        byPractice[practiceName].available += Math.max(0, personCapacity - personAllocated);
      }

      forecasts.push({
        weekStart: weekStart.toISOString().split('T')[0],
        totalCapacity,
        allocatedHours: totalAllocated,
        availableHours: Math.max(0, totalCapacity - totalAllocated),
        utilizationPct: totalCapacity > 0 ? totalAllocated / totalCapacity : 0,
        byPractice,
      });
    }

    return forecasts;
  }

  private getDateRange(query: AvailabilityQueryDto): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (query.startDate) {
      startDate = new Date(query.startDate);
    } else {
      startDate = new Date(now);
    }

    if (query.endDate) {
      endDate = new Date(query.endDate);
    } else {
      // Default to 4 weeks from now
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 28);
    }

    return { startDate, endDate };
  }

  private getWorkingDaysBetween(start: Date, end: Date): number {
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
