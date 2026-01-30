import { Injectable } from '@nestjs/common';
import { prisma } from '@vrm/database';

@Injectable()
export class PracticesService {
  async findAll() {
    return prisma.practice.findMany({
      include: {
        members: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return prisma.practice.findUnique({
      where: { id },
      include: {
        members: {
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
}
