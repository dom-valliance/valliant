import { Injectable } from '@nestjs/common';
import {
  prisma,
  Prisma,
  ProjectStatus,
  CommercialModel,
  ProjectType,
  TeamModel,
} from '@vrm/database';

interface CreateProjectDto {
  name: string;
  code: string;
  clientId: string;
  primaryPracticeId: string;
  valuePartnerId: string;
  status?: ProjectStatus;
  commercialModel: CommercialModel;
  estimatedValueCents?: number;
  valueSharePct?: number;
  agreedFeeCents?: number;
  contingencyPct?: number;
  startDate: string;
  endDate?: string;
  projectType: ProjectType;
  parentProjectId?: string;
  teamModel?: TeamModel;
  notes?: string;
}

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
    // Delete related records first in a transaction
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get all phases for this project
      const phases = await tx.phase.findMany({
        where: { projectId: id },
        select: { id: true },
      });
      const phaseIds = phases.map((p) => p.id);

      // Delete task skills for tasks in these phases
      if (phaseIds.length > 0) {
        const tasks = await tx.task.findMany({
          where: { phaseId: { in: phaseIds } },
          select: { id: true },
        });
        const taskIds = tasks.map((t) => t.id);

        if (taskIds.length > 0) {
          await tx.taskSkill.deleteMany({
            where: { taskId: { in: taskIds } },
          });
        }

        // Delete tasks
        await tx.task.deleteMany({
          where: { phaseId: { in: phaseIds } },
        });
      }

      // Delete time entries
      await tx.timeEntry.deleteMany({
        where: { projectId: id },
      });

      // Delete allocations
      await tx.allocation.deleteMany({
        where: { projectId: id },
      });

      // Delete phases
      await tx.phase.deleteMany({
        where: { projectId: id },
      });

      // Delete project practices
      await tx.projectPractice.deleteMany({
        where: { projectId: id },
      });

      // Delete project role assignments and project roles
      const projectRoles = await tx.projectRole.findMany({
        where: { projectId: id },
        select: { id: true },
      });
      const projectRoleIds = projectRoles.map((pr) => pr.id);

      if (projectRoleIds.length > 0) {
        await tx.projectRoleAssignment.deleteMany({
          where: { projectRoleId: { in: projectRoleIds } },
        });
      }

      await tx.projectRole.deleteMany({
        where: { projectId: id },
      });

      // Delete project tags
      await tx.projectTag.deleteMany({
        where: { projectId: id },
      });

      // Finally delete the project
      return tx.project.delete({
        where: { id },
      });
    });
  }
}
