import { Injectable } from '@nestjs/common';
import { prisma } from '@vrm/database';

@Injectable()
export class RolesService {
  async findAll() {
    return prisma.role.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return prisma.role.findUnique({
      where: { id },
    });
  }
}
