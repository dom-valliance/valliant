import { Injectable } from '@nestjs/common';
import { prisma, TaskStatus, TaskPriority } from '@vrm/database';

interface CreateTaskDto {
  phaseId: string;
  name: string;
  description?: string;
  estimatedHours?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  requiredRoleId?: string;
  sortOrder: number;
}

interface UpdateTaskDto {
  name?: string;
  description?: string;
  estimatedHours?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
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
        status: data.status || TaskStatus.TODO,
        priority: data.priority || TaskPriority.MEDIUM,
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
    const { requiredRoleId, ...rest } = data;
    return prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(requiredRoleId !== undefined && {
          requiredRole: requiredRoleId
            ? { connect: { id: requiredRoleId } }
            : { disconnect: true },
        }),
      },
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
