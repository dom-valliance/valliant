import { Injectable } from '@nestjs/common';
import { prisma } from '@vrm/database';

@Injectable()
export class SkillsService {
  async findAll() {
    return prisma.skill.findMany({
      orderBy: [
        {
          category: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async findOne(id: string) {
    return prisma.skill.findUnique({
      where: { id },
    });
  }

  async findByCategory(category: string) {
    return prisma.skill.findMany({
      where: {
        category: category.toUpperCase() as any,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
