import { Injectable } from '@nestjs/common';
import { prisma, Prisma } from '@vrm/database';
import { CreateAllocationDto } from '@vrm/shared-types';
import { EventPublisher, EventType } from '@vrm/events';

interface AllocationFilters {
  personId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class AllocationsService {
  private eventPublisher: EventPublisher;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.eventPublisher = new EventPublisher(redisUrl);
  }

  async findAll(filters: AllocationFilters) {
    const where: Prisma.AllocationWhereInput = {};

    if (filters.personId) {
      where.personId = filters.personId;
    }
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }
    if (filters.startDate || filters.endDate) {
      // Find allocations that overlap with the given date range
      if (filters.startDate && filters.endDate) {
        where.AND = [
          { startDate: { lte: new Date(filters.endDate) } },
          { endDate: { gte: new Date(filters.startDate) } },
        ];
      } else if (filters.startDate) {
        where.endDate = { gte: new Date(filters.startDate) };
      } else if (filters.endDate) {
        where.startDate = { lte: new Date(filters.endDate) };
      }
    }

    return prisma.allocation.findMany({
      where,
      include: {
        person: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
        phase: {
          select: { id: true, name: true },
        },
        role: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { startDate: 'asc' },
        { person: { name: 'asc' } },
      ],
    });
  }

  async findOne(id: string) {
    return prisma.allocation.findUnique({
      where: { id },
      include: {
        person: {
          select: { id: true, name: true, email: true, costRateCents: true },
        },
        project: {
          include: { client: true, primaryPractice: true },
        },
        phase: true,
        task: true,
        role: true,
      },
    });
  }

  async findByPerson(personId: string, startDate?: string, endDate?: string) {
    const where: Prisma.AllocationWhereInput = { personId };

    if (startDate && endDate) {
      where.AND = [
        { startDate: { lte: new Date(endDate) } },
        { endDate: { gte: new Date(startDate) } },
      ];
    }

    return prisma.allocation.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        phase: {
          select: { id: true, name: true },
        },
        role: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async findByProject(projectId: string) {
    return prisma.allocation.findMany({
      where: { projectId },
      include: {
        person: {
          select: { id: true, name: true, email: true },
        },
        phase: {
          select: { id: true, name: true },
        },
        role: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { startDate: 'asc' },
        { person: { name: 'asc' } },
      ],
    });
  }

  async create(createAllocationDto: CreateAllocationDto) {
    // Get person's current cost rate for snapshot
    const person = await prisma.person.findUnique({
      where: { id: createAllocationDto.personId },
      select: { costRateCents: true },
    });

    if (!person) {
      throw new Error('Person not found');
    }

    const allocation = await prisma.allocation.create({
      data: {
        personId: createAllocationDto.personId,
        projectId: createAllocationDto.projectId,
        phaseId: createAllocationDto.phaseId,
        taskId: createAllocationDto.taskId,
        startDate: new Date(createAllocationDto.startDate),
        endDate: new Date(createAllocationDto.endDate),
        hoursPerDay: createAllocationDto.hoursPerDay,
        allocationType: createAllocationDto.allocationType,
        status: createAllocationDto.status || 'TENTATIVE',
        roleId: createAllocationDto.roleId,
        notes: createAllocationDto.notes,
        costRateCentsSnapshot: person.costRateCents,
      },
      include: {
        person: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
        phase: {
          select: { id: true, name: true },
        },
        role: {
          select: { id: true, name: true },
        },
      },
    });

    // Publish event
    if (allocation.projectId) {
      await this.eventPublisher.publish({
        type: EventType.ALLOCATION_CREATED,
        payload: {
          allocationId: allocation.id,
          personId: allocation.personId,
          projectId: allocation.projectId,
          phaseId: allocation.phaseId || undefined,
          startDate: allocation.startDate.toISOString(),
          endDate: allocation.endDate.toISOString(),
          hoursPerDay: Number(allocation.hoursPerDay),
          costRateCentsSnapshot: allocation.costRateCentsSnapshot,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: allocation.id,
        },
      });
    }

    return allocation;
  }

  async update(id: string, updateData: Partial<CreateAllocationDto>) {
    const allocation = await prisma.allocation.update({
      where: { id },
      data: {
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
      },
      include: {
        person: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
        phase: {
          select: { id: true, name: true },
        },
        role: {
          select: { id: true, name: true },
        },
      },
    });

    // Publish event
    if (allocation.projectId) {
      await this.eventPublisher.publish({
        type: EventType.ALLOCATION_UPDATED,
        payload: {
          allocationId: allocation.id,
          personId: allocation.personId,
          projectId: allocation.projectId,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: allocation.id,
        },
      });
    }

    return allocation;
  }

  async confirm(id: string) {
    return this.update(id, { status: 'CONFIRMED' } as any);
  }

  async complete(id: string) {
    return this.update(id, { status: 'COMPLETED' } as any);
  }

  async delete(id: string) {
    const allocation = await prisma.allocation.delete({
      where: { id },
    });

    // Publish event
    if (allocation.projectId) {
      await this.eventPublisher.publish({
        type: EventType.ALLOCATION_DELETED,
        payload: {
          allocationId: allocation.id,
          personId: allocation.personId,
          projectId: allocation.projectId,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: allocation.id,
        },
      });
    }

    return allocation;
  }
}
