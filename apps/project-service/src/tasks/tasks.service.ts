import { Injectable } from '@nestjs/common';
import { prisma } from '@vrm/database';

interface CreateTaskDto {
  phaseId: string;
  name: string;
  description?: string;
  estimatedHours?: number;
  status?: string;
  priority?: string;
  requiredRoleId?: string;
  sortOrder: number;
}

interface UpdateTaskDto {
  name?: string;
  description?: string;
  estimatedHours?: number;
  status?: string;
  priority?: string;
  requiredRoleId?: string;
  sortOrder?: number;
}

@Injectable()
export class TasksService {
  async findAll() {
    return prisma.task.findMany({
      include: {
        phase: {
          select: {
            id: true,
            name: true,
            project: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        requiredRole: true,
      },
      orderBy: [{ phaseId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findByPhase(phaseId: string) {
    return prisma.task.findMany({
      where: { phaseId },
      include: {
        requiredRole: true,
        requiredSkills: {
          include: { skill: true },
        },
        _count: {
          select: { allocations: true, timeEntries: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        phase: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                code: true,
                client: true,
              },
            },
          },
        },
        requiredRole: true,
        requiredSkills: {
          include: { skill: true },
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

  async create(data: CreateTaskDto) {
    return prisma.task.create({
      data: {
        ...data,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
      },
      include: {
        phase: {
          select: {
            id: true,
            name: true,
            project: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        requiredRole: true,
      },
    });
  }

  async update(id: string, data: UpdateTaskDto) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        phase: {
          select: {
            id: true,
            name: true,
          },
        },
        requiredRole: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  }
}
