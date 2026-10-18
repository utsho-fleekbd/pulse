import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';

import type { Monitor } from '../types/monitor.types.js';
import type { MonitorRepository } from './monitor.repository.js';
import { MonitorCheck } from '../types/monitor-check.types.js';
import { CheckResult } from '../../checks/types/check-result.types.js';

@Injectable()
export class InMemoryMonitorRepository implements MonitorRepository {
  private readonly monitors = new Map<string, Monitor>();
  private readonly checks = new Map<string, MonitorCheck[]>();

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

  recordCheck(monitorId: string, result: CheckResult): void {
    const monitor = this.monitors.get(monitorId);

    if (monitor === undefined) {
      throw new NotFoundException(`Monitor with ID ${monitorId} was not found`);
    }

    const record: MonitorCheck = {
      ...result,
      id: randomUUID(),
      monitorId,
    };

    this.monitors.set(monitorId, {
      ...monitor,
      status: result.status,
    });

    const existing = this.checks.get(monitorId) ?? [];

    this.checks.set(monitorId, [...existing, record]);
  }

  findChecks(monitorId: string, limit: number): MonitorCheck[] {
    return [...(this.checks.get(monitorId) ?? [])]
      .sort(
        (a, b) =>
          b.checkedAt.getTime() - a.checkedAt.getTime() ||
          b.id.localeCompare(a.id),
      )
      .slice(0, limit);
  }
}
