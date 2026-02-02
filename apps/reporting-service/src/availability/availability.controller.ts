import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { PersonAvailability, CapacityForecast } from './dto/availability.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  async getAvailability(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skillIds') skillIds?: string,
    @Query('roleId') roleId?: string,
    @Query('practiceId') practiceId?: string,
    @Query('minHours') minHours?: string
  ): Promise<PersonAvailability[]> {
    return this.availabilityService.getAvailability({
      startDate,
      endDate,
      skillIds: skillIds ? skillIds.split(',') : undefined,
      roleId,
      practiceId,
      minHours: minHours ? parseInt(minHours, 10) : undefined,
    });
  }

  @Get('capacity-forecast')
  async getCapacityForecast(@Query('weeks') weeks?: string): Promise<CapacityForecast[]> {
    const weeksAhead = weeks ? parseInt(weeks, 10) : 12;
    return this.availabilityService.getCapacityForecast(weeksAhead);
  }
}
