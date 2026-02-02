import { Controller, Get, Param, Query } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialQueryDto } from './dto/financial-query.dto';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get()
  async getSummary(@Query() query: FinancialQueryDto) {
    return this.financialService.getFinancialSummary(query);
  }

  @Get('projects')
  async getAllProjects(@Query() query: FinancialQueryDto) {
    return this.financialService.getAllProjectFinancials(query);
  }

  @Get('project/:id')
  async getProject(@Param('id') id: string) {
    return this.financialService.getProjectFinancials(id);
  }

  @Get('phase-budgets')
  async getPhaseBudgets(@Query() query: FinancialQueryDto) {
    return this.financialService.getPhaseBudgets(query);
  }

  @Get('value-partner/:id')
  async getValuePartner(@Param('id') id: string) {
    return this.financialService.getValuePartnerSummary(id);
  }
}
