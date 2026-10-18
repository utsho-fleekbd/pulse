import { desc, eq } from 'drizzle-orm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';

import type { Database } from '../../database/db.js';
import { monitors } from '../../database/schemas/monitors.schema.js';

import type { Monitor } from '../types/monitor.types.js';
import type { MonitorRepository } from './monitor.repository.js';
import { CheckResult } from '../../checks/types/check-result.types.js';
import {
  CheckResultRow,
  checkResults,
} from '../../database/schemas/check-results.schema.js';
import { randomUUID } from 'node:crypto';
import { MonitorCheck } from '../types/monitor-check.types.js';

@Injectable()
export class DrizzleMonitorRepository implements MonitorRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: Database,
  ) {}

  save(monitor: Monitor): Monitor {
    this.db
      .insert(monitors)
      .values(monitor)
      .onConflictDoUpdate({
        target: monitors.id,
        set: {
          name: monitor.name,
          url: monitor.url,
          status: monitor.status,
        },
      })
      .run();

    return { ...monitor };
  }

  findAll(): Monitor[] {
    return this.db.select().from(monitors).all();
  }

  findById(id: string): Monitor | undefined {
    return this.db.select().from(monitors).where(eq(monitors.id, id)).get();
  }

  recordCheck(monitorId: string, result: CheckResult): void {
    this.db.transaction((tx) => {
      const monitor = tx
        .select({ id: monitors.id })
        .from(monitors)
        .where(eq(monitors.id, monitorId))
        .get();

      if (monitor === undefined) {
        throw new NotFoundException(
          `Monitor with ID ${monitorId} was not found`,
        );
      }

      tx.update(monitors)
        .set({ status: result.status })
        .where(eq(monitors.id, monitorId))
        .run();

      tx.insert(checkResults)
        .values({
          id: randomUUID(),
          monitorId,
          status: result.status,
          statusCode: result.statusCode,
          reason: result.status === 'down' ? result.reason : null,
          responseTimeMs: result.responseTimeMs,
          checkedAt: result.checkedAt,
        })
        .run();
    });
  }

  findChecks(monitorId: string, limit: number): MonitorCheck[] {
    const rows = this.db
      .select()
      .from(checkResults)
      .where(eq(checkResults.monitorId, monitorId))
      .orderBy(desc(checkResults.checkedAt), desc(checkResults.id))
      .limit(limit)
      .all();

    return rows.map(toMonitorCheck);
  }
}

function toMonitorCheck(row: CheckResultRow): MonitorCheck {
  const common = {
    id: row.id,
    monitorId: row.monitorId,
    responseTimeMs: row.responseTimeMs,
    checkedAt: row.checkedAt,
  };

  if (row.status === 'up') {
    if (row.statusCode === null) {
      throw new Error(`Invalid successful check: ${row.id}`);
    }

    return {
      ...common,
      status: 'up',
      statusCode: row.statusCode,
    };
  }

  if (row.reason === null) {
    throw new Error(`Invalid failed check: ${row.id}`);
  }

  return {
    ...common,
    status: 'down',
    statusCode: row.statusCode,
    reason: row.reason,
  };
}
