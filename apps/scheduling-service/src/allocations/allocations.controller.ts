import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from '@vrm/shared-types';

@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Get()
  findAll(
    @Query('personId') personId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.allocationsService.findAll({ personId, projectId, startDate, endDate });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.allocationsService.findOne(id);
  }

  @Get('person/:personId')
  findByPerson(
    @Param('personId') personId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.allocationsService.findByPerson(personId, startDate, endDate);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.allocationsService.findByProject(projectId);
  }

  @Post()
  create(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationsService.create(createAllocationDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateAllocationDto>) {
    return this.allocationsService.update(id, updateData);
  }

  @Put(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.allocationsService.confirm(id);
  }

  @Put(':id/complete')
  complete(@Param('id') id: string) {
    return this.allocationsService.complete(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.allocationsService.delete(id);
  }
}
