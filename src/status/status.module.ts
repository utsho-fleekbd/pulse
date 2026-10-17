import { Module } from '@nestjs/common';

import { MonitorsModule } from '../monitors/monitors.module.js';

import { StatusController } from './status.controller.js';
import { StatusService } from './status.service.js';

@Module({
  imports: [MonitorsModule],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
