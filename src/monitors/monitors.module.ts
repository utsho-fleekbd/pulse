import { Module } from '@nestjs/common';

import { MonitorsController } from './monitors.controller.js';
import { MonitorsService } from './monitors.service.js';
import { MONITOR_REPOSITORY } from './repository/monitor.repository.js';
import { ChecksModule } from '../checks/checks.module.js';
import { MonitorsScheduler } from './monitors.scheduler.js';
import { DrizzleMonitorRepository } from './repository/drizzle-monitor.repository.js';

@Module({
  imports: [ChecksModule],
  controllers: [MonitorsController],
  providers: [
    MonitorsService,
    MonitorsScheduler,
    {
      provide: MONITOR_REPOSITORY,
      useClass: DrizzleMonitorRepository,
    },
  ],
  exports: [MonitorsService],
})
export class MonitorsModule {}
