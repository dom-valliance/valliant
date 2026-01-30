import { Injectable } from '@nestjs/common';
import { prisma } from '@vrm/database';
import { CreatePersonDto } from '@vrm/shared-types';
import { EventPublisher, EventType } from '@vrm/events';

@Injectable()
export class PeopleService {
  private eventPublisher: EventPublisher;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.eventPublisher = new EventPublisher(redisUrl);
  }

  async findAll() {
    return prisma.person.findMany({
      include: {
        role: true,
        department: true,
        practices: {
          include: {
            practice: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return prisma.person.findUnique({
      where: { id },
      include: {
        role: true,
        department: true,
        practices: {
          include: {
            practice: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        allocations: {
          include: {
            project: true,
            phase: true,
          },
        },
      },
    });
  }

  async create(createPersonDto: CreatePersonDto) {
    const { practiceIds, ...personData } = createPersonDto;

    const person = await prisma.person.create({
      data: {
        ...personData,
        startDate: new Date(personData.startDate),
        endDate: personData.endDate ? new Date(personData.endDate) : null,
      },
      include: {
        role: true,
      },
    });

    // Assign practices if provided
    if (practiceIds && practiceIds.length > 0) {
      await prisma.practiceMember.createMany({
        data: practiceIds.map((practiceId, index) => ({
          personId: person.id,
          practiceId,
          isPrimary: index === 0,
        })),
      });
    }

    // Publish event
    await this.eventPublisher.publish({
      type: EventType.PERSON_CREATED,
      payload: {
        personId: person.id,
        name: person.name,
        email: person.email,
        type: person.type,
        roleId: person.roleId,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId: person.id,
      },
    });

    return person;
  }

  async update(id: string, updateData: Partial<CreatePersonDto>) {
    return prisma.person.update({
      where: { id },
      data: {
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
      },
      include: {
        role: true,
        practices: {
          include: {
            practice: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.person.delete({
      where: { id },
    });
  }
}
