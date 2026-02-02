import { Injectable } from '@nestjs/common';
import { UtilisationService } from '../utilisation/utilisation.service';
import { FinancialService } from '../financial/financial.service';
import { PrismaClient, TimeEntryStatus } from '@prisma/client';

@Injectable()
export class ExportsService {
  private prisma: PrismaClient;

  constructor(
    private readonly utilisationService: UtilisationService,
    private readonly financialService: FinancialService
  ) {
    this.prisma = new PrismaClient();
  }

  async exportUtilisationCsv(startDate?: string, endDate?: string): Promise<string> {
    const data = await this.utilisationService.getByPerson({ startDate, endDate });

    const headers = [
      'Person Name',
      'Type',
      'Role',
      'Practice',
      'Capacity (hours)',
      'Billable Hours',
      'Non-Billable Hours',
      'Internal Hours',
      'Leave Hours',
      'Utilisation Rate (%)',
      'Billable Rate (%)',
      'Target (%)',
      'Variance (%)',
      'Status',
    ];

    const rows = data.map((p) => [
      p.personName,
      p.personType,
      p.role,
      p.practice || '',
      p.capacity.toFixed(1),
      p.billableHours.toFixed(1),
      p.nonBillableHours.toFixed(1),
      p.internalHours.toFixed(1),
      p.leaveHours.toFixed(1),
      (p.utilisationRate * 100).toFixed(1),
      (p.billableRate * 100).toFixed(1),
      (p.utilisationTarget * 100).toFixed(1),
      (p.variance * 100).toFixed(1),
      p.status,
    ]);

    return this.toCsv(headers, rows);
  }

  async exportFinancialCsv(): Promise<string> {
    const data = await this.financialService.getAllProjectFinancials({});

    const headers = [
      'Project Code',
      'Project Name',
      'Client',
      'Value Partner',
      'Status',
      'Commercial Model',
      'Estimated Value (GBP)',
      'Value Share (%)',
      'Agreed Fee (GBP)',
      'Implied Revenue (GBP)',
      'Estimated Cost (GBP)',
      'Actual Cost (GBP)',
      'Gross Margin (GBP)',
      'Margin (%)',
      'Budget Status',
      'Cost Consumed (%)',
    ];

    const rows = data.map((p) => [
      p.projectCode,
      p.projectName,
      p.clientName,
      p.valuePartnerName,
      p.status,
      p.commercialModel,
      p.estimatedValueCents ? (p.estimatedValueCents / 100).toFixed(2) : '',
      p.valueSharePct ? (p.valueSharePct * 100).toFixed(1) : '',
      p.agreedFeeCents ? (p.agreedFeeCents / 100).toFixed(2) : '',
      (p.impliedRevenueCents / 100).toFixed(2),
      (p.estimatedCostCents / 100).toFixed(2),
      (p.actualCostCents / 100).toFixed(2),
      (p.grossMarginCents / 100).toFixed(2),
      (p.marginPct * 100).toFixed(1),
      p.budgetStatus,
      (p.costConsumedPct * 100).toFixed(1),
    ]);

    return this.toCsv(headers, rows);
  }

  async exportPhaseBudgetsCsv(projectId?: string): Promise<string> {
    const data = await this.financialService.getPhaseBudgets({ projectId });

    const headers = [
      'Project Code',
      'Project Name',
      'Phase Name',
      'Phase Type',
      'Estimated Hours',
      'Estimated Cost (GBP)',
      'Actual Cost (GBP)',
      'Budget Alert (%)',
      'Consumed (%)',
      'Status',
      'Remaining (GBP)',
    ];

    const rows = data.map((p) => [
      p.projectCode,
      p.projectName,
      p.phaseName,
      p.phaseType,
      p.estimatedHours?.toFixed(1) || '',
      p.estimatedCostCents ? (p.estimatedCostCents / 100).toFixed(2) : '',
      (p.actualCostCents / 100).toFixed(2),
      (p.budgetAlertPct * 100).toFixed(0),
      (p.consumedPct * 100).toFixed(1),
      p.status,
      (p.remainingCents / 100).toFixed(2),
    ]);

    return this.toCsv(headers, rows);
  }

  async exportTimesheetCsv(startDate?: string, endDate?: string): Promise<string> {
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const timeEntries = await this.prisma.timeEntry.findMany({
      where: {
        ...(startDate || endDate ? { date: dateFilter } : {}),
        status: { in: [TimeEntryStatus.APPROVED, TimeEntryStatus.LOCKED] },
      },
      include: {
        person: { include: { role: true } },
        project: { include: { client: true } },
        phase: true,
        task: true,
      },
      orderBy: [{ date: 'asc' }, { person: { name: 'asc' } }],
    });

    const headers = [
      'Date',
      'Person Name',
      'Role',
      'Client',
      'Project Code',
      'Project Name',
      'Phase',
      'Task',
      'Entry Type',
      'Hours',
      'Description',
      'Status',
      'Created At',
      'Locked At',
    ];

    const rows = timeEntries.map((t) => [
      t.date.toISOString().split('T')[0],
      t.person.name,
      t.person.role.name,
      t.project?.client.name || '',
      t.project?.code || '',
      t.project?.name || '',
      t.phase?.name || '',
      t.task?.name || '',
      t.entryType,
      Number(t.hours).toFixed(2),
      t.description || '',
      t.status,
      t.createdAt.toISOString(),
      t.lockedAt?.toISOString() || '',
    ]);

    return this.toCsv(headers, rows);
  }

  private toCsv(headers: string[], rows: (string | number)[][]): string {
    const escape = (val: string | number): string => {
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerLine = headers.map(escape).join(',');
    const dataLines = rows.map((row) => row.map(escape).join(','));

    return [headerLine, ...dataLines].join('\n');
  }
}
