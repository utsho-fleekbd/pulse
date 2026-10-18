import type { Monitor } from '../types/monitor.types.js';

export const MONITOR_REPOSITORY = Symbol('MONITOR_REPOSITORY');

export interface MonitorRepository {
  save(monitor: Monitor): Monitor;

  findAll(): Monitor[];

  findById(id: string): Monitor | undefined;
}
