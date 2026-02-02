import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ExportsService } from './exports.service';

@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('utilisation/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="utilisation-report.csv"')
  async exportUtilisation(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response
  ) {
    const csv = await this.exportsService.exportUtilisationCsv(startDate, endDate);
    if (res) {
      res.send(csv);
    }
    return csv;
  }

  @Get('financial/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="financial-report.csv"')
  async exportFinancial(@Res() res?: Response) {
    const csv = await this.exportsService.exportFinancialCsv();
    if (res) {
      res.send(csv);
    }
    return csv;
  }

  @Get('phase-budgets/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="phase-budgets-report.csv"')
  async exportPhaseBudgets(
    @Query('projectId') projectId?: string,
    @Res() res?: Response
  ) {
    const csv = await this.exportsService.exportPhaseBudgetsCsv(projectId);
    if (res) {
      res.send(csv);
    }
    return csv;
  }

  @Get('timesheet/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="timesheet-report.csv"')
  async exportTimesheet(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response
  ) {
    const csv = await this.exportsService.exportTimesheetCsv(startDate, endDate);
    if (res) {
      res.send(csv);
    }
    return csv;
  }
}
