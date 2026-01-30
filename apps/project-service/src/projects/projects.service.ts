import { Injectable } from '@nestjs/common';
import { prisma } from '@vrm/database';
import { CreateProjectDto } from '@vrm/shared-types';

@Injectable()
export class ProjectsService {
  async findAll() {
    return prisma.project.findMany({
      include: {
        client: true,
        primaryPractice: true,
        valuePartner: true,
        phases: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        primaryPractice: true,
        valuePartner: true,
        phases: { orderBy: { sortOrder: 'asc' } },
        allocations: { include: { person: true } },
      },
    });
  }

  async create(data: CreateProjectDto) {
    return prisma.project.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        client: true,
        primaryPractice: true,
        valuePartner: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.project.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: {
        client: true,
        primaryPractice: true,
        valuePartner: true,
        phases: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }
}
