import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { PhasesModule } from './phases/phases.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [ClientsModule, ProjectsModule, PhasesModule, TasksModule],
})
export class AppModule {}
