import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Monitor } from './monitor.types.js';
import { CreateMonitorDto } from './dto/create-monitor.dto.js';

@Injectable()
export class MonitorsService {
  private readonly monitors: Monitor[] = [];

  create(input: CreateMonitorDto): Monitor {
    const monitor: Monitor = {
      id: randomUUID(),
      name: input.name,
      url: input.url,
      status: 'pending',
    };

    this.monitors.push(monitor);

    return { ...monitor };
  }

  findAll(): Monitor[] {
    return this.monitors.map((monitor) => ({
      ...monitor,
    }));
  }

  findOne(id: string): Monitor {
    const monitor = this.monitors.find((monitor) => monitor.id === id);

    if (!monitor) {
      throw new NotFoundException(`Monitor with ID ${id} was not found`);
    }

    return { ...monitor };
  }
}
