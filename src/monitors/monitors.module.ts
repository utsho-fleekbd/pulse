import { Module } from '@nestjs/common';
import { MonitorsController } from './monitors.controller.js';
import { MonitorsService } from './monitors.service.js';
import { MONITOR_REPOSITORY } from './monitor.repository.js';
import { InMemoryMonitorRepository } from './in-memory-monitor.repository.js';

@Module({
  controllers: [MonitorsController],
  providers: [
    MonitorsService,
    {
      provide: MONITOR_REPOSITORY,
      useClass: InMemoryMonitorRepository,
    },
  ],
})
export class MonitorsModule {}
