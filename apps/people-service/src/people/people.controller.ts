import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PeopleService } from './people.service';
import { CreatePersonDto } from '@vrm/shared-types';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  findAll() {
    return this.peopleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.peopleService.findOne(id);
  }

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.peopleService.create(createPersonDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreatePersonDto>) {
    return this.peopleService.update(id, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.peopleService.delete(id);
  }
}
