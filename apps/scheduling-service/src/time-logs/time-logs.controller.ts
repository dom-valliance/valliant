import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TimeLogsService } from './time-logs.service';
import { CreateTimeLogDto } from '@vrm/shared-types';

@Controller('time-logs')
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @Get()
  findAll(
    @Query('personId') personId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timeLogsService.findAll({ personId, projectId, startDate, endDate });
  }

  @Get('person/:personId/week/:weekStart')
  getWeeklyLogs(
    @Param('personId') personId: string,
    @Param('weekStart') weekStart: string,
  ) {
    return this.timeLogsService.getWeeklyLogs(personId, weekStart);
  }

  @Get('person/:personId/prefill/:weekStart')
  prefillFromAllocations(
    @Param('personId') personId: string,
    @Param('weekStart') weekStart: string,
  ) {
    return this.timeLogsService.prefillFromAllocations(personId, weekStart);
  }

  @Get('summary')
  getSummary(
    @Query('personId') personId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timeLogsService.getSummary({ personId, projectId, startDate, endDate });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timeLogsService.findOne(id);
  }

  @Post()
  create(@Body() createTimeLogDto: CreateTimeLogDto) {
    return this.timeLogsService.create(createTimeLogDto);
  }

  @Post('batch')
  createBatch(@Body() createTimeLogDtos: CreateTimeLogDto[]) {
    return this.timeLogsService.createBatch(createTimeLogDtos);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateTimeLogDto>) {
    return this.timeLogsService.update(id, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.timeLogsService.delete(id);
  }
}
