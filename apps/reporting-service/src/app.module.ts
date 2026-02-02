import { Module } from '@nestjs/common';
import { UtilisationModule } from './utilisation/utilisation.module';
import { FinancialModule } from './financial/financial.module';
import { AvailabilityModule } from './availability/availability.module';
import { ExportsModule } from './exports/exports.module';

@Module({
  imports: [
    UtilisationModule,
    FinancialModule,
    AvailabilityModule,
    ExportsModule,
  ],
})
export class AppModule {}
