import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import type { Monitor } from './monitor.types.js';
import { MonitorsService } from './monitors.service.js';

@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Post()
  create(@Body() input: CreateMonitorDto): Monitor {
    return this.monitorsService.create(input);
  }

  @Get()
  findAll(): Monitor[] {
    return this.monitorsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ): Monitor {
    return this.monitorsService.findOne(id);
  }
}
