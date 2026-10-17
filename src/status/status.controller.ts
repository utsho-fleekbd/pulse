import { Controller, Get } from '@nestjs/common';

import { StatusService } from './status.service.js';
import type { StatusSummary } from './status.types.js';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get('summary')
  getSummary(): StatusSummary {
    return this.statusService.getSummary();
  }
}
