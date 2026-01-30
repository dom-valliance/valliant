import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PhasesService } from './phases.service';

@Controller('phases')
export class PhasesController {
  constructor(private readonly phasesService: PhasesService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    if (projectId) {
      return this.phasesService.findByProject(projectId);
    }
    return this.phasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phasesService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.phasesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.phasesService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.phasesService.delete(id);
  }
}
