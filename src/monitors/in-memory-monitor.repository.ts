import { Injectable } from '@nestjs/common';

import type { Monitor } from './monitor.types.js';
import type { MonitorRepository } from './monitor.repository.js';

@Injectable()
export class InMemoryMonitorRepository implements MonitorRepository {
  private readonly monitors = new Map<string, Monitor>();

  save(monitor: Monitor): Monitor {
    this.monitors.set(monitor.id, { ...monitor });

    return { ...monitor };
  }

  findAll(): Monitor[] {
    return Array.from(this.monitors.values(), (monitor) => ({ ...monitor }));
  }

  findById(id: string): Monitor | undefined {
    const monitor = this.monitors.get(id);

    return monitor === undefined ? undefined : { ...monitor };
  }
}
