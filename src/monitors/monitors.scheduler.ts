import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MonitorsService } from './monitors.service.js';

@Injectable()
export class MonitorsScheduler {
  private readonly logger = new Logger(MonitorsScheduler.name);

  constructor(private readonly monitorsService: MonitorsService) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'monitor-health-checks',
    waitForCompletion: true,
  })
  async runChecks(): Promise<void> {
    const monitors = this.monitorsService.findAll();

    for (const monitor of monitors) {
      try {
        const result = await this.monitorsService.checkNow(monitor.id);

        this.logger.debug(`Monitor ${monitor.id}: ${result.status}`);
      } catch (error: unknown) {
        this.logger.error(
          `Failed to check monitor ${monitor.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
