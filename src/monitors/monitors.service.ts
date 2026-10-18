import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Monitor, MonitorStatus } from './types/monitor.types.js';
import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import {
  MONITOR_REPOSITORY,
  type MonitorRepository,
} from './repository/monitor.repository.js';
import { ChecksService } from '../checks/checks.service.js';
import { CheckResult } from '../checks/types/check-result.types.js';
import { MonitorCheck } from './types/monitor-check.types.js';

@Injectable()
export class MonitorsService {
  constructor(
    @Inject(MONITOR_REPOSITORY)
    private readonly repository: MonitorRepository,
    private readonly checksService: ChecksService,
  ) {}

  create(input: CreateMonitorDto): Monitor {
    const monitor: Monitor = {
      id: randomUUID(),
      name: input.name,
      url: input.url,
      status: 'pending',
    };

    this.repository.save(monitor);

    return { ...monitor };
  }

  findAll(status?: MonitorStatus, limit?: number): Monitor[] {
    const monitors = this.repository.findAll();

    const filtered =
      status === undefined
        ? monitors
        : monitors.filter((monitor) => monitor.status === status);

    return limit === undefined ? filtered : filtered.slice(0, limit);
  }

  findOne(id: string): Monitor {
    const monitor = this.repository.findById(id);

    if (monitor === undefined) {
      throw new NotFoundException(`Monitor with ID ${id} was not found`);
    }

    return monitor;
  }

  async checkNow(id: string): Promise<CheckResult> {
    const monitor = this.findOne(id);

    const result = await this.checksService.check(monitor.url);

    this.repository.recordCheck(monitor.id, result);

    return result;
  }

  findChecks(id: string, limit = 20): MonitorCheck[] {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    this.findOne(id);

    return this.repository.findChecks(id, limit);
  }
}
