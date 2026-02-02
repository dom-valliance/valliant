import { Controller, Get, Param, Query } from '@nestjs/common';
import { AvailabilityService, PersonAvailability, UtilisationMetrics, BenchCapacityResult } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('person/:personId')
  getPersonAvailability(
    @Param('personId') personId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<PersonAvailability> {
    return this.availabilityService.getPersonAvailability(personId, startDate, endDate);
  }

  @Get('people')
  getAllPeopleAvailability(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<PersonAvailability[]> {
    return this.availabilityService.getAllPeopleAvailability(startDate, endDate);
  }

  @Get('utilisation/:personId')
  getPersonUtilisation(
    @Param('personId') personId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<UtilisationMetrics> {
    return this.availabilityService.getPersonUtilisation(personId, startDate, endDate);
  }

  @Get('utilisation')
  getAllUtilisation(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<UtilisationMetrics[]> {
    return this.availabilityService.getAllUtilisation(startDate, endDate);
  }

  @Get('bench')
  getBenchCapacity(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<BenchCapacityResult> {
    return this.availabilityService.getBenchCapacity(startDate, endDate);
  }
}
