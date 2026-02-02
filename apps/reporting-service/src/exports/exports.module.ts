import { Module } from '@nestjs/common';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { UtilisationModule } from '../utilisation/utilisation.module';
import { FinancialModule } from '../financial/financial.module';

@Module({
  imports: [UtilisationModule, FinancialModule],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
