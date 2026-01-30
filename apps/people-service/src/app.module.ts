import { Module } from '@nestjs/common';
import { PeopleModule } from './people/people.module';
import { RolesModule } from './roles/roles.module';
import { PracticesModule } from './practices/practices.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [PeopleModule, RolesModule, PracticesModule, SkillsModule],
})
export class AppModule {}
