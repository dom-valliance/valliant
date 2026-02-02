import { Controller, Get, Query } from '@nestjs/common';
import { UtilisationService } from './utilisation.service';
import { UtilisationQueryDto } from './dto/utilisation-query.dto';

@Controller('utilisation')
export class UtilisationController {
  constructor(private readonly utilisationService: UtilisationService) {}

  @Get()
  async getSummary(@Query() query: UtilisationQueryDto) {
    return this.utilisationService.getUtilisationSummary(query);
  }

  @Get('by-person')
  async getByPerson(@Query() query: UtilisationQueryDto) {
    return this.utilisationService.getByPerson(query);
  }

  @Get('by-practice')
  async getByPractice(@Query() query: UtilisationQueryDto) {
    return this.utilisationService.getByPractice(query);
  }

  @Get('by-project')
  async getByProject(@Query() query: UtilisationQueryDto) {
    return this.utilisationService.getByProject(query);
  }

  @Get('bench')
  async getBench(@Query() query: UtilisationQueryDto) {
    return this.utilisationService.getBench(query);
  }
}
