import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import type { Monitor, MonitorStatus } from './monitor.types.js';
import { MonitorsService } from './monitors.service.js';
import { ParseMonitorStatusPipe } from './pipes/parse-monitor-status.pipe.js';
import { CheckResult } from '../checks/check-result.types.js';

@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Post()
  create(@Body() input: CreateMonitorDto): Monitor {
    return this.monitorsService.create(input);
  }

  @Get()
  findAll(
    @Query('status', new ParseMonitorStatusPipe()) status?: MonitorStatus,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Monitor[] {
    return this.monitorsService.findAll(status, limit);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ): Monitor {
    return this.monitorsService.findOne(id);
  }

  @Post(':id/check')
  @HttpCode(HttpStatus.OK)
  checkNow(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ): Promise<CheckResult> {
    return this.monitorsService.checkNow(id);
  }
}
