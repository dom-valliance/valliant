import { Injectable } from '@nestjs/common';
import { prisma, Prisma } from '@vrm/database';

// Type for allocation from Prisma query with project guaranteed
type AllocationWithRelations = Prisma.AllocationGetPayload<{
  include: {
    project: { select: { id: true; name: true; code: true } };
    phase: { select: { id: true; name: true } };
  };
}> & { project: { id: string; name: string; code: string } };

export interface DayAvailability {
  date: string;
  capacity: number;
  confirmedHours: number;
  tentativeHours: number;
  availableHours: number;
  allocations: {
    id: string;
    projectName: string;
    projectCode: string;
    phaseName?: string;
    hours: number;
    status: string;
    type: string;
  }[];
}

export interface PersonAvailability {
  person: {
    id: string;
    name: string;
    email: string;
    role: string;
    dailyCapacity: number;
    utilisationTarget: number;
  };
  days: DayAvailability[];
  summary: {
    totalCapacity: number;
    confirmedHours: number;
    tentativeHours: number;
    availableHours: number;
    utilizationRate: number;
  };
}

export interface BenchDataItem {
  personId: string;
  personName: string;
  role: string;
  totalCapacity: number;
  allocatedHours: number;
  benchHours: number;
  benchPercentage: number;
}

export interface BenchCapacityResult {
  period: { start: string; end: string };
  summary: {
    totalCapacity: number;
    totalAllocated: number;
    totalBench: number;
    benchPercentage: number;
  };
  byPerson: BenchDataItem[];
}

export interface UtilisationMetrics {
  personId: string;
  personName: string;
  period: { start: string; end: string };
  capacity: {
    totalHours: number;
    workingDays: number;
  };
  logged: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
  };
  allocated: {
    confirmedHours: number;
    tentativeHours: number;
  };
  utilisation: {
    rate: number;
    target: number;
    variance: number;
    status: 'ABOVE_TARGET' | 'ON_TARGET' | 'BELOW_TARGET' | 'SIGNIFICANTLY_BELOW';
  };
}

@Injectable()
export class AvailabilityService {
  async getPersonAvailability(personId: string, startDate: string, endDate: string): Promise<PersonAvailability> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: { role: true },
    });

    if (!person) {
      throw new Error('Person not found');
    }

    const allocations = await prisma.allocation.findMany({
      where: {
        personId,
        status: { in: ['TENTATIVE', 'CONFIRMED'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        phase: { select: { id: true, name: true } },
      },
    });

    const dailyCapacity = Number(person.defaultHoursPerWeek) / 5;
    const workingDays = person.workingDays || [1, 2, 3, 4, 5];
    const days: DayAvailability[] = [];

    let totalCapacity = 0;
    let totalConfirmed = 0;
    let totalTentative = 0;

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWorkingDay = workingDays.includes(dayOfWeek === 0 ? 7 : dayOfWeek);

      if (isWorkingDay) {
        const dayAllocations = allocations.filter(
          (a) => a.startDate <= current && a.endDate >= current && a.project
        ) as AllocationWithRelations[];

        const confirmedHours = dayAllocations
          .filter((a: AllocationWithRelations) => a.status === 'CONFIRMED')
          .reduce((sum: number, a: AllocationWithRelations) => sum + Number(a.hoursPerDay), 0);

        const tentativeHours = dayAllocations
          .filter((a: AllocationWithRelations) => a.status === 'TENTATIVE')
          .reduce((sum: number, a: AllocationWithRelations) => sum + Number(a.hoursPerDay), 0);

        const availableHours = Math.max(0, dailyCapacity - confirmedHours);

        days.push({
          date: current.toISOString().split('T')[0],
          capacity: dailyCapacity,
          confirmedHours,
          tentativeHours,
          availableHours,
          allocations: dayAllocations.map((a: AllocationWithRelations) => ({
            id: a.id,
            projectName: a.project.name,
            projectCode: a.project.code,
            phaseName: a.phase?.name,
            hours: Number(a.hoursPerDay),
            status: a.status,
            type: a.allocationType,
          })),
        });

        totalCapacity += dailyCapacity;
        totalConfirmed += confirmedHours;
        totalTentative += tentativeHours;
      }

      current.setDate(current.getDate() + 1);
    }

    const totalAvailable = Math.max(0, totalCapacity - totalConfirmed);
    const utilizationRate = totalCapacity > 0 ? totalConfirmed / totalCapacity : 0;

    return {
      person: {
        id: person.id,
        name: person.name,
        email: person.email,
        role: person.role.name,
        dailyCapacity,
        utilisationTarget: Number(person.utilisationTarget),
      },
      days,
      summary: {
        totalCapacity,
        confirmedHours: totalConfirmed,
        tentativeHours: totalTentative,
        availableHours: totalAvailable,
        utilizationRate,
      },
    };
  }

  async getAllPeopleAvailability(startDate: string, endDate: string): Promise<PersonAvailability[]> {
    const people = await prisma.person.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    const availabilities = await Promise.all(
      people.map((p: { id: string }) => this.getPersonAvailability(p.id, startDate, endDate))
    );

    // Sort by available hours (most available first)
    return availabilities.sort(
      (a, b) => b.summary.availableHours - a.summary.availableHours
    );
  }

  async getPersonUtilisation(personId: string, startDate: string, endDate: string): Promise<UtilisationMetrics> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: { role: true },
    });

    if (!person) {
      throw new Error('Person not found');
    }

    // Get time logs for the period
    const timeLogs = await prisma.timeEntry.findMany({
      where: {
        personId,
        date: { gte: start, lte: end },
      },
    });

    // Get allocations for the period
    const allocations = await prisma.allocation.findMany({
      where: {
        personId,
        status: { in: ['TENTATIVE', 'CONFIRMED'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    const dailyCapacity = Number(person.defaultHoursPerWeek) / 5;
    const workingDays = this.countWorkingDays(start, end, person.workingDays || [1, 2, 3, 4, 5]);
    const totalCapacity = workingDays * dailyCapacity;

    // Calculate logged hours
    type TimeEntryRecord = { hours: Prisma.Decimal; entryType: string };
    const totalLogged = timeLogs.reduce((sum: number, e: TimeEntryRecord) => sum + Number(e.hours), 0);
    const billableHours = timeLogs
      .filter((e: TimeEntryRecord) => e.entryType === 'BILLABLE')
      .reduce((sum: number, e: TimeEntryRecord) => sum + Number(e.hours), 0);
    const nonBillableHours = timeLogs
      .filter((e: TimeEntryRecord) => e.entryType === 'NON_BILLABLE')
      .reduce((sum: number, e: TimeEntryRecord) => sum + Number(e.hours), 0);

    // Calculate allocated hours
    let confirmedHours = 0;
    let tentativeHours = 0;

    for (const alloc of allocations) {
      const overlapStart = new Date(Math.max(alloc.startDate.getTime(), start.getTime()));
      const overlapEnd = new Date(Math.min(alloc.endDate.getTime(), end.getTime()));
      const overlapDays = this.countWorkingDays(overlapStart, overlapEnd, person.workingDays || [1, 2, 3, 4, 5]);
      const hours = overlapDays * Number(alloc.hoursPerDay);

      if (alloc.status === 'CONFIRMED') {
        confirmedHours += hours;
      } else {
        tentativeHours += hours;
      }
    }

    // Calculate utilisation rate (logged hours / capacity)
    const utilisationRate = totalCapacity > 0 ? totalLogged / totalCapacity : 0;
    const target = Number(person.utilisationTarget);
    const variance = utilisationRate - target;

    let status: UtilisationMetrics['utilisation']['status'];
    if (variance > 0.05) {
      status = 'ABOVE_TARGET';
    } else if (variance >= -0.05) {
      status = 'ON_TARGET';
    } else if (variance >= -0.15) {
      status = 'BELOW_TARGET';
    } else {
      status = 'SIGNIFICANTLY_BELOW';
    }

    return {
      personId: person.id,
      personName: person.name,
      period: { start: startDate, end: endDate },
      capacity: {
        totalHours: totalCapacity,
        workingDays,
      },
      logged: {
        totalHours: totalLogged,
        billableHours,
        nonBillableHours,
      },
      allocated: {
        confirmedHours,
        tentativeHours,
      },
      utilisation: {
        rate: utilisationRate,
        target,
        variance,
        status,
      },
    };
  }

  async getAllUtilisation(startDate: string, endDate: string): Promise<UtilisationMetrics[]> {
    const people = await prisma.person.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    const metrics = await Promise.all(
      people.map((p: { id: string }) => this.getPersonUtilisation(p.id, startDate, endDate))
    );

    // Sort by utilisation rate (lowest first to highlight who needs work)
    return metrics.sort((a, b) => a.utilisation.rate - b.utilisation.rate);
  }

  async getBenchCapacity(startDate: string, endDate: string): Promise<BenchCapacityResult> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all active people
    const people = await prisma.person.findMany({
      where: { status: 'ACTIVE' },
      include: { role: true },
    });

    // Get all confirmed allocations in range
    const allocations = await prisma.allocation.findMany({
      where: {
        status: 'CONFIRMED',
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    // Define types for better type inference
    type PersonWithRole = Prisma.PersonGetPayload<{ include: { role: true } }>;
    type AllocationRecord = { personId: string; startDate: Date; endDate: Date; hoursPerDay: Prisma.Decimal };

    // Calculate bench capacity per person
    const benchData: BenchDataItem[] = people.map((person: PersonWithRole) => {
      const dailyCapacity = Number(person.defaultHoursPerWeek) / 5;
      const workingDays = this.countWorkingDays(start, end, person.workingDays || [1, 2, 3, 4, 5]);
      const totalCapacity = workingDays * dailyCapacity;

      const personAllocations = allocations.filter((a: AllocationRecord) => a.personId === person.id);
      let allocatedHours = 0;

      for (const alloc of personAllocations) {
        const overlapStart = new Date(Math.max(alloc.startDate.getTime(), start.getTime()));
        const overlapEnd = new Date(Math.min(alloc.endDate.getTime(), end.getTime()));
        const overlapDays = this.countWorkingDays(overlapStart, overlapEnd, person.workingDays || [1, 2, 3, 4, 5]);
        allocatedHours += overlapDays * Number(alloc.hoursPerDay);
      }

      const benchHours = Math.max(0, totalCapacity - allocatedHours);
      const benchPercentage = totalCapacity > 0 ? benchHours / totalCapacity : 0;

      return {
        personId: person.id,
        personName: person.name,
        role: person.role.name,
        totalCapacity,
        allocatedHours,
        benchHours,
        benchPercentage,
      };
    });

    // Summary stats
    const totalCapacity = benchData.reduce((sum: number, p: BenchDataItem) => sum + p.totalCapacity, 0);
    const totalAllocated = benchData.reduce((sum: number, p: BenchDataItem) => sum + p.allocatedHours, 0);
    const totalBench = benchData.reduce((sum: number, p: BenchDataItem) => sum + p.benchHours, 0);

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalCapacity,
        totalAllocated,
        totalBench,
        benchPercentage: totalCapacity > 0 ? totalBench / totalCapacity : 0,
      },
      byPerson: benchData.sort((a: BenchDataItem, b: BenchDataItem) => b.benchHours - a.benchHours),
    };
  }

  private countWorkingDays(start: Date, end: Date, workingDays: number[]): number {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
      if (workingDays.includes(normalizedDay)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
}
