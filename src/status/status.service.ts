import { Injectable } from '@nestjs/common';

import { MonitorsService } from '../monitors/monitors.service.js';
import type { StatusSummary } from './status.types.js';

@Injectable()
export class StatusService {
  constructor(private readonly monitorsService: MonitorsService) {}

  getSummary(): StatusSummary {
    const monitors = this.monitorsService.findAll();

    const summary: StatusSummary = {
      total: 0,
      up: 0,
      down: 0,
      pending: 0,
    };

    for (const monitor of monitors) {
      summary.total += 1;
      summary[monitor.status] += 1;
    }

    return summary;
  }
}
