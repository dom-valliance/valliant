import { Module } from '@nestjs/common';
import { HubSpotApiService } from './hubspot-api.service';
import { HubSpotMapperService } from './hubspot-mapper.service';

@Module({
  providers: [HubSpotApiService, HubSpotMapperService],
  exports: [HubSpotApiService, HubSpotMapperService],
})
export class HubSpotModule {}
