import { Injectable } from '@nestjs/common';
import { PrismaClient, CommercialModel, TimeEntryStatus, ProjectStatus } from '@prisma/client';
import {
  FinancialQueryDto,
  ProjectFinancials,
  PhaseBudget,
  ValuePartnerSummary,
  FinancialSummary,
  BudgetStatus,
} from './dto/financial-query.dto';

@Injectable()
export class FinancialService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getFinancialSummary(query: FinancialQueryDto): Promise<FinancialSummary> {
    const projects = await this.getAllProjectFinancials(query);

    const activeProjects = projects.filter(
      (p) => p.status === 'ACTIVE' || p.status === 'CONFIRMED'
    );

    const totalRevenueCents = projects.reduce((sum, p) => sum + p.impliedRevenueCents, 0);
    const totalCostCents = projects.reduce((sum, p) => sum + p.actualCostCents, 0);
    const totalMarginCents = totalRevenueCents - totalCostCents;

    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      totalRevenueCents,
      totalCostCents,
      totalMarginCents,
      averageMarginPct: totalRevenueCents > 0 ? totalMarginCents / totalRevenueCents : 0,
      projectsOnTrack: projects.filter((p) => p.budgetStatus === BudgetStatus.ON_TRACK).length,
      projectsAtRisk: projects.filter((p) => p.budgetStatus === BudgetStatus.WARNING).length,
      projectsOverBudget: projects.filter((p) => p.budgetStatus === BudgetStatus.EXCEEDED).length,
    };
  }

  async getProjectFinancials(projectId: string): Promise<ProjectFinancials | null> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        valuePartner: true,
        phases: {
          include: {
            timeEntries: {
              where: {
                status: { in: [TimeEntryStatus.APPROVED, TimeEntryStatus.LOCKED] },
              },
              include: { person: true },
            },
          },
        },
        timeEntries: {
          where: {
            status: { in: [TimeEntryStatus.APPROVED, TimeEntryStatus.LOCKED] },
          },
          include: { person: true },
        },
      },
    });

    if (!project) return null;

    return this.calculateProjectFinancials(project);
  }

  async getAllProjectFinancials(query: FinancialQueryDto): Promise<ProjectFinancials[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        ...(query.projectId && { id: query.projectId }),
        ...(query.clientId && { clientId: query.clientId }),
        ...(query.practiceId && { primaryPracticeId: query.practiceId }),
        ...(query.valuePartnerId && { valuePartnerId: query.valuePartnerId }),
      },
      include: {
        client: true,
        valuePartner: true,
        phases: {
          include: {
            timeEntries: {
              where: {
                status: { in: [TimeEntryStatus.APPROVED, TimeEntryStatus.LOCKED] },
              },
              include: { person: true },
            },
          },
        },
        timeEntries: {
          where: {
            status: { in: [TimeEntryStatus.APPROVED, TimeEntryStatus.LOCKED] },
          },
          include: { person: true },
        },
      },
    });

    const results = projects.map((project) => this.calculateProjectFinancials(project));

    // Filter by budget status if specified
    if (query.budgetStatus) {
      return results.filter((p) => p.budgetStatus === query.budgetStatus);
    }

    return results;
  }

  async getPhaseBudgets(query: FinancialQueryDto): Promise<PhaseBudget[]> {
    const phases = await this.prisma.phase.findMany({
      where: {
        ...(query.projectId && { projectId: query.projectId }),
        project: {
          ...(query.clientId && { clientId: query.clientId }),
          ...(query.practiceId && { primaryPracticeId: query.practiceId }),
        },
      },
      include: {
        project: true,
        timeEntries: {
          where: {
            status: { in: [TimeEntryStatus.APPROVED, TimeEntryStatus.LOCKED] },
          },
          include: { person: true },
        },
      },
    });

    const results = phases.map((phase) => {
      const actualCostCents = phase.timeEntries.reduce((sum, entry) => {
        const hourlyCost = entry.person.costRateCents / 8;
        return sum + Number(entry.hours) * hourlyCost;
      }, 0);

      const estimatedCostCents = phase.estimatedCostCents ? Number(phase.estimatedCostCents) : null;
      const budgetAlertPct = Number(phase.budgetAlertPct) || 0.8;

      let consumedPct = 0;
      let status = BudgetStatus.ON_TRACK;
      let remainingCents = 0;

      if (estimatedCostCents && estimatedCostCents > 0) {
        consumedPct = actualCostCents / estimatedCostCents;
        remainingCents = estimatedCostCents - actualCostCents;

        if (consumedPct >= 1.0) {
          status = BudgetStatus.EXCEEDED;
        } else if (consumedPct >= budgetAlertPct) {
          status = BudgetStatus.WARNING;
        }
      }

      return {
        phaseId: phase.id,
        phaseName: phase.name,
        phaseType: phase.phaseType,
        projectId: phase.projectId,
        projectName: phase.project.name,
        projectCode: phase.project.code,
        estimatedHours: phase.estimatedHours ? Number(phase.estimatedHours) : null,
        estimatedCostCents,
        actualCostCents: Math.round(actualCostCents),
        budgetAlertPct,
        consumedPct,
        status,
        remainingCents: Math.round(remainingCents),
      };
    });

    // Filter by budget status if specified
    if (query.budgetStatus) {
      return results.filter((p) => p.status === query.budgetStatus);
    }

    return results;
  }

  async getValuePartnerSummary(valuePartnerId: string): Promise<ValuePartnerSummary | null> {
    const valuePartner = await this.prisma.person.findUnique({
      where: { id: valuePartnerId },
    });

    if (!valuePartner) return null;

    const projects = await this.getAllProjectFinancials({ valuePartnerId });

    const totalRevenueCents = projects.reduce((sum, p) => sum + p.impliedRevenueCents, 0);
    const totalCostCents = projects.reduce((sum, p) => sum + p.actualCostCents, 0);
    const totalMarginCents = totalRevenueCents - totalCostCents;

    return {
      valuePartnerId,
      valuePartnerName: valuePartner.name,
      projectCount: projects.length,
      totalRevenueCents,
      totalCostCents,
      totalMarginCents,
      averageMarginPct: totalRevenueCents > 0 ? totalMarginCents / totalRevenueCents : 0,
      projects,
    };
  }

  private calculateProjectFinancials(project: {
    id: string;
    name: string;
    code: string;
    status: ProjectStatus;
    commercialModel: CommercialModel;
    estimatedValueCents: bigint | null;
    valueSharePct: any;
    agreedFeeCents: bigint | null;
    contingencyPct: any;
    client: { name: string };
    valuePartner: { name: string };
    phases: Array<{
      estimatedCostCents: bigint | null;
      budgetAlertPct: any;
      timeEntries: Array<{ hours: any; person: { costRateCents: number } }>;
    }>;
    timeEntries: Array<{ hours: any; person: { costRateCents: number } }>;
  }): ProjectFinancials {
    // Calculate actual costs from time entries
    const actualCostCents = project.timeEntries.reduce((sum, entry) => {
      const hourlyCost = entry.person.costRateCents / 8;
      return sum + Number(entry.hours) * hourlyCost;
    }, 0);

    // Calculate estimated costs from phases
    const estimatedCostCents = project.phases.reduce((sum, phase) => {
      return sum + (phase.estimatedCostCents ? Number(phase.estimatedCostCents) : 0);
    }, 0);

    // Calculate contingency
    const contingencyPct = Number(project.contingencyPct) || 0.2;
    const totalBudgetCents = estimatedCostCents * (1 + contingencyPct);

    // Calculate implied revenue based on commercial model
    let impliedRevenueCents = 0;
    const estimatedValueCents = project.estimatedValueCents ? Number(project.estimatedValueCents) : null;
    const valueSharePct = project.valueSharePct ? Number(project.valueSharePct) : null;
    const agreedFeeCents = project.agreedFeeCents ? Number(project.agreedFeeCents) : null;

    if (project.commercialModel === CommercialModel.VALUE_SHARE && estimatedValueCents && valueSharePct) {
      impliedRevenueCents = estimatedValueCents * valueSharePct;
    } else if (project.commercialModel === CommercialModel.FIXED_PRICE && agreedFeeCents) {
      impliedRevenueCents = agreedFeeCents;
    } else if (project.commercialModel === CommercialModel.HYBRID) {
      // For hybrid, take the higher of value share or agreed fee
      const valueShareRevenue =
        estimatedValueCents && valueSharePct ? estimatedValueCents * valueSharePct : 0;
      impliedRevenueCents = Math.max(valueShareRevenue, agreedFeeCents || 0);
    }

    // Calculate margin
    const grossMarginCents = impliedRevenueCents - actualCostCents;
    const marginPct = impliedRevenueCents > 0 ? grossMarginCents / impliedRevenueCents : 0;

    // Calculate budget status
    const costConsumedPct = totalBudgetCents > 0 ? actualCostCents / totalBudgetCents : 0;
    let budgetStatus = BudgetStatus.ON_TRACK;
    if (costConsumedPct >= 1.0) {
      budgetStatus = BudgetStatus.EXCEEDED;
    } else if (costConsumedPct >= 0.8) {
      budgetStatus = BudgetStatus.WARNING;
    }

    // Count phases with issues
    let phasesWithWarning = 0;
    let phasesExceeded = 0;
    for (const phase of project.phases) {
      if (phase.estimatedCostCents) {
        const phaseActualCost = phase.timeEntries.reduce((sum, entry) => {
          const hourlyCost = entry.person.costRateCents / 8;
          return sum + Number(entry.hours) * hourlyCost;
        }, 0);
        const phaseConsumed = phaseActualCost / Number(phase.estimatedCostCents);
        const alertPct = Number(phase.budgetAlertPct) || 0.8;

        if (phaseConsumed >= 1.0) phasesExceeded++;
        else if (phaseConsumed >= alertPct) phasesWithWarning++;
      }
    }

    return {
      projectId: project.id,
      projectName: project.name,
      projectCode: project.code,
      clientName: project.client.name,
      valuePartnerName: project.valuePartner.name,
      commercialModel: project.commercialModel,
      status: project.status,

      estimatedValueCents,
      valueSharePct,
      agreedFeeCents,
      impliedRevenueCents: Math.round(impliedRevenueCents),

      estimatedCostCents: Math.round(estimatedCostCents),
      actualCostCents: Math.round(actualCostCents),
      contingencyPct,
      totalBudgetCents: Math.round(totalBudgetCents),

      grossMarginCents: Math.round(grossMarginCents),
      marginPct,

      costConsumedPct,
      budgetStatus,

      phasesCount: project.phases.length,
      phasesWithWarning,
      phasesExceeded,
    };
  }
}
