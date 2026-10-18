import { eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';

import type { Database } from '../database/db.js';
import { monitors } from '../database/schemas/monitors.schema.js';

import type { Monitor } from './monitor.types.js';
import type { MonitorRepository } from './monitor.repository.js';

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
}
