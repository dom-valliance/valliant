import { Injectable } from '@nestjs/common';
import { prisma, PhaseType, PhaseStatus } from '@vrm/database';

interface CreatePhaseDto {
  projectId: string;
  name: string;
  phaseType: PhaseType;
  startDate: string;
  endDate?: string;
  estimatedHours?: number;
  estimatedCostCents?: string | number;
  budgetAlertPct?: number;
  sortOrder: number;
}

interface UpdatePhaseDto {
  name?: string;
  phaseType?: PhaseType;
  status?: PhaseStatus;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  estimatedCostCents?: string | number;
  budgetAlertPct?: number;
  sortOrder?: number;
}

@Injectable()
export class PhasesService {
  async findAll() {
    return prisma.phase.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: [{ projectId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findByProject(projectId: string) {
    return prisma.phase.findMany({
      where: { projectId },
      include: {
        tasks: true,
        _count: {
          select: { tasks: true, allocations: true, timeEntries: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    return prisma.phase.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            client: true,
            primaryPractice: true,
          },
        },
        tasks: {
          include: {
            requiredRole: true,
            requiredSkills: {
              include: { skill: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        allocations: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: CreatePhaseDto) {
    return prisma.phase.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        estimatedCostCents: data.estimatedCostCents
          ? BigInt(data.estimatedCostCents)
          : null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdatePhaseDto) {
    return prisma.phase.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        estimatedCostCents: data.estimatedCostCents
          ? BigInt(data.estimatedCostCents)
          : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.phase.delete({
      where: { id },
    });
  }
}
