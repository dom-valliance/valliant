import { Injectable } from '@nestjs/common';
import { prisma } from '@vrm/database';

interface CreateClientDto {
  name: string;
  industry?: string;
  primaryContact?: string;
  contactEmail?: string;
  notes?: string;
}

interface UpdateClientDto {
  name?: string;
  industry?: string;
  primaryContact?: string;
  contactEmail?: string;
  notes?: string;
}

@Injectable()
export class ClientsService {
  async findAll() {
    return prisma.client.findMany({
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
        },
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            primaryPractice: true,
            valuePartner: { select: { id: true, name: true } },
            phases: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: CreateClientDto) {
    return prisma.client.create({
      data,
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateClientDto) {
    return prisma.client.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.client.delete({
      where: { id },
    });
  }
}
