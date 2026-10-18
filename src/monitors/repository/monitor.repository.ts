import { CheckResult } from '../../checks/types/check-result.types.js';
import { MonitorCheck } from '../types/monitor-check.types.js';
import type { Monitor } from '../types/monitor.types.js';

export const MONITOR_REPOSITORY = Symbol('MONITOR_REPOSITORY');

export interface MonitorRepository {
  save(monitor: Monitor): Monitor;

  findAll(): Monitor[];

  findById(id: string): Monitor | undefined;

  recordCheck(monitorId: string, result: CheckResult): void;

  findChecks(monitorId: string, limit: number): MonitorCheck[];
}
