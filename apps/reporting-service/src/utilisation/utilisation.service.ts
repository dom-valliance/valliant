import { Injectable } from '@nestjs/common';
import { PrismaClient, TimeEntryType, PersonStatus } from '@prisma/client';
import {
  UtilisationQueryDto,
  PersonUtilisation,
  PracticeUtilisation,
  ProjectUtilisation,
  BenchPerson,
  UtilisationSummary,
} from './dto/utilisation-query.dto';

@Injectable()
export class UtilisationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getUtilisationSummary(query: UtilisationQueryDto): Promise<UtilisationSummary> {
    const { startDate, endDate } = this.getDateRange(query);
    const byPerson = await this.getByPerson(query);

    const totalCapacity = byPerson.reduce((sum, p) => sum + p.capacity, 0);
    const totalBillableHours = byPerson.reduce((sum, p) => sum + p.billableHours, 0);
    const totalNonBillableHours = byPerson.reduce((sum, p) => sum + p.nonBillableHours, 0);

    const averageUtilisationRate =
      totalCapacity > 0 ? (totalBillableHours + totalNonBillableHours) / totalCapacity : 0;
    const averageBillableRate = totalCapacity > 0 ? totalBillableHours / totalCapacity : 0;

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      overall: {
        totalCapacity,
        totalBillableHours,
        totalNonBillableHours,
        averageUtilisationRate,
        averageBillableRate,
        peopleCount: byPerson.length,
        underUtilisedCount: byPerson.filter((p) => p.status === 'UNDER').length,
        overUtilisedCount: byPerson.filter((p) => p.status === 'OVER').length,
      },
    };
  }

  async getByPerson(query: UtilisationQueryDto): Promise<PersonUtilisation[]> {
    const { startDate, endDate } = this.getDateRange(query);

    const people = await this.prisma.person.findMany({
      where: {
        status: PersonStatus.ACTIVE,
        ...(query.personId && { id: query.personId }),
        ...(query.practiceId && {
          practices: { some: { practiceId: query.practiceId } },
        }),
      },
      include: {
        role: true,
        practices: {
          include: { practice: true },
          where: { isPrimary: true },
        },
        timeEntries: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const workingDays = this.getWorkingDaysBetween(startDate, endDate);

    return people.map((person) => {
      const hoursPerDay = Number(person.defaultHoursPerWeek) / 5;
      const capacity = workingDays * hoursPerDay;

      const billableHours = person.timeEntries
        .filter((t) => t.entryType === TimeEntryType.BILLABLE)
        .reduce((sum, t) => sum + Number(t.hours), 0);

      const nonBillableHours = person.timeEntries
        .filter((t) => t.entryType === TimeEntryType.NON_BILLABLE)
        .reduce((sum, t) => sum + Number(t.hours), 0);

      const internalHours = person.timeEntries
        .filter((t) => t.entryType === TimeEntryType.INTERNAL)
        .reduce((sum, t) => sum + Number(t.hours), 0);

      const leaveHours = person.timeEntries
        .filter((t) => t.entryType === TimeEntryType.LEAVE)
        .reduce((sum, t) => sum + Number(t.hours), 0);

      const benchHours = person.timeEntries
        .filter((t) => t.entryType === TimeEntryType.BENCH)
        .reduce((sum, t) => sum + Number(t.hours), 0);

      const totalWorkedHours = billableHours + nonBillableHours + internalHours;
      const adjustedCapacity = capacity - leaveHours;
      const utilisationRate = adjustedCapacity > 0 ? (billableHours + nonBillableHours) / adjustedCapacity : 0;
      const billableRate = adjustedCapacity > 0 ? billableHours / adjustedCapacity : 0;
      const utilisationTarget = Number(person.utilisationTarget);
      const variance = utilisationRate - utilisationTarget;

      let status: 'UNDER' | 'ON_TARGET' | 'OVER' = 'ON_TARGET';
      if (variance < -0.05) status = 'UNDER';
      if (variance > 0.1) status = 'OVER';

      return {
        personId: person.id,
        personName: person.name,
        personType: person.type,
        role: person.role.name,
        practice: person.practices[0]?.practice.name || null,
        capacity,
        billableHours,
        nonBillableHours,
        internalHours,
        leaveHours,
        benchHours,
        totalWorkedHours,
        utilisationRate,
        billableRate,
        utilisationTarget,
        variance,
        status,
      };
    });
  }

  async getByPractice(query: UtilisationQueryDto): Promise<PracticeUtilisation[]> {
    const byPerson = await this.getByPerson(query);

    const practices = await this.prisma.practice.findMany({
      include: {
        members: { include: { person: true } },
      },
    });

    return practices.map((practice) => {
      const memberIds = practice.members.map((m) => m.personId);
      const practicePersons = byPerson.filter((p) => memberIds.includes(p.personId));

      const totalCapacity = practicePersons.reduce((sum, p) => sum + p.capacity, 0);
      const totalBillableHours = practicePersons.reduce((sum, p) => sum + p.billableHours, 0);
      const totalNonBillableHours = practicePersons.reduce((sum, p) => sum + p.nonBillableHours, 0);

      return {
        practiceId: practice.id,
        practiceName: practice.name,
        memberCount: practicePersons.length,
        totalCapacity,
        totalBillableHours,
        totalNonBillableHours,
        averageUtilisationRate:
          totalCapacity > 0 ? (totalBillableHours + totalNonBillableHours) / totalCapacity : 0,
        averageTarget:
          practicePersons.length > 0
            ? practicePersons.reduce((sum, p) => sum + p.utilisationTarget, 0) / practicePersons.length
            : 0.8,
      };
    });
  }

  async getByProject(query: UtilisationQueryDto): Promise<ProjectUtilisation[]> {
    const { startDate, endDate } = this.getDateRange(query);

    const projects = await this.prisma.project.findMany({
      where: {
        ...(query.projectId && { id: query.projectId }),
      },
      include: {
        client: true,
        allocations: {
          where: {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        },
        timeEntries: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    return projects.map((project) => {
      const totalAllocatedHours = project.allocations.reduce((sum, a) => {
        const allocStart = new Date(Math.max(a.startDate.getTime(), startDate.getTime()));
        const allocEnd = new Date(Math.min(a.endDate.getTime(), endDate.getTime()));
        const days = this.getWorkingDaysBetween(allocStart, allocEnd);
        return sum + days * Number(a.hoursPerDay);
      }, 0);

      const totalLoggedHours = project.timeEntries.reduce((sum, t) => sum + Number(t.hours), 0);
      const billableHours = project.timeEntries
        .filter((t) => t.entryType === TimeEntryType.BILLABLE)
        .reduce((sum, t) => sum + Number(t.hours), 0);

      const uniquePersonIds = new Set(project.allocations.map((a) => a.personId));

      return {
        projectId: project.id,
        projectName: project.name,
        projectCode: project.code,
        clientName: project.client.name,
        status: project.status,
        totalAllocatedHours,
        totalLoggedHours,
        billableHours,
        teamSize: uniquePersonIds.size,
      };
    });
  }

  async getBench(query: UtilisationQueryDto): Promise<BenchPerson[]> {
    const { startDate, endDate } = this.getDateRange(query);

    const people = await this.prisma.person.findMany({
      where: {
        status: PersonStatus.ACTIVE,
      },
      include: {
        role: true,
        practices: {
          include: { practice: true },
          where: { isPrimary: true },
        },
        skills: {
          include: { skill: true },
        },
        allocations: {
          where: {
            status: 'CONFIRMED',
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        },
      },
    });

    const workingDays = this.getWorkingDaysBetween(startDate, endDate);

    return people
      .map((person) => {
        const hoursPerDay = Number(person.defaultHoursPerWeek) / 5;
        const totalCapacity = workingDays * hoursPerDay;

        const allocatedHours = person.allocations.reduce((sum, a) => {
          const allocStart = new Date(Math.max(a.startDate.getTime(), startDate.getTime()));
          const allocEnd = new Date(Math.min(a.endDate.getTime(), endDate.getTime()));
          const days = this.getWorkingDaysBetween(allocStart, allocEnd);
          return sum + days * Number(a.hoursPerDay);
        }, 0);

        const availableHours = Math.max(0, totalCapacity - allocatedHours);

        // Calculate days on bench (days with no allocations)
        const daysOnBench = this.calculateDaysOnBench(person.allocations, startDate, endDate);

        return {
          personId: person.id,
          personName: person.name,
          personType: person.type,
          role: person.role.name,
          practice: person.practices[0]?.practice.name || null,
          availableHours,
          skills: person.skills.map((s) => s.skill.name),
          daysOnBench,
        };
      })
      .filter((p) => p.availableHours > 0)
      .sort((a, b) => b.availableHours - a.availableHours);
  }

  private getDateRange(query: UtilisationQueryDto): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (query.startDate) {
      startDate = new Date(query.startDate);
    } else {
      // Default to start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (query.endDate) {
      endDate = new Date(query.endDate);
    } else {
      // Default to end of current month
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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

  private calculateDaysOnBench(
    allocations: Array<{ startDate: Date; endDate: Date }>,
    periodStart: Date,
    periodEnd: Date
  ): number {
    const current = new Date(periodStart);
    let daysOnBench = 0;

    while (current <= periodEnd) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        const isAllocated = allocations.some(
          (a) => current >= a.startDate && current <= a.endDate
        );
        if (!isAllocated) daysOnBench++;
      }
      current.setDate(current.getDate() + 1);
    }

    return daysOnBench;
  }
}
