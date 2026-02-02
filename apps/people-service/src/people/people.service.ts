import { Injectable } from '@nestjs/common';
import { prisma, Prisma } from '@vrm/database';
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
        data: practiceIds.map((practiceId: string, index: number) => ({
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
    const { practiceIds, roleId, ...rest } = updateData;

    // Build the update data object
    const data: Prisma.PersonUpdateInput = {
      ...rest,
      startDate: rest.startDate ? new Date(rest.startDate) : undefined,
      endDate: rest.endDate ? new Date(rest.endDate) : undefined,
    };

    // Handle roleId using Prisma relation syntax
    if (roleId) {
      data.role = { connect: { id: roleId } };
    }

    // Update person and handle practices in a transaction
    return prisma.$transaction(async (tx) => {
      // Update practice memberships if provided
      if (practiceIds !== undefined) {
        // Delete existing practice memberships
        await tx.practiceMember.deleteMany({
          where: { personId: id },
        });

        // Create new practice memberships
        if (practiceIds.length > 0) {
          await tx.practiceMember.createMany({
            data: practiceIds.map((practiceId: string, index: number) => ({
              personId: id,
              practiceId,
              isPrimary: index === 0,
            })),
          });
        }
      }

      // Update the person
      return tx.person.update({
        where: { id },
        data,
        include: {
          role: true,
          practices: {
            include: {
              practice: true,
            },
          },
        },
      });
    });
  }

  async delete(id: string) {
    // Delete related records first in a transaction
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete practice memberships
      await tx.practiceMember.deleteMany({
        where: { personId: id },
      });

      // Delete person skills
      await tx.personSkill.deleteMany({
        where: { personId: id },
      });

      // Unlink user account (don't delete, just unlink)
      await tx.user.updateMany({
        where: { personId: id },
        data: { personId: null },
      });

      // Delete the person
      return tx.person.delete({
        where: { id },
      });
    });
  }
}
