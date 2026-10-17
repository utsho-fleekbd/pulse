import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { MonitorsService } from './monitors.service.js';
import { MONITOR_REPOSITORY, MonitorRepository } from './monitor.repository.js';
import { InMemoryMonitorRepository } from './in-memory-monitor.repository.js';
import { Monitor } from './monitor.types.js';
import { randomUUID } from 'node:crypto';

describe('MonitorService', () => {
  let service: MonitorsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MonitorsService,
        {
          provide: MONITOR_REPOSITORY,
          useClass: InMemoryMonitorRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(MonitorsService);
  });

  it('should initially have no monitors', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('should create a monitor', () => {
    const created = service.create({
      name: 'Example',
      url: 'https://example.com',
    });

    expect(created.id).toBeDefined();
    expect(created.status).toBe('pending');
    expect(service.findAll()).toHaveLength(1);
    expect(service.findOne(created.id)).toEqual(created);
  });

  it('should throw if a monitor does not exist', () => {
    expect(() => {
      service.findOne('nonexistent-id');
    }).toThrow(NotFoundException);
  });

  it('should not expose internal state', () => {
    const created = service.create({
      name: 'Example',
      url: 'https://example.com',
    });

    const returned = service.findOne(created.id);
    returned.name = 'Modified externally';

    expect(service.findOne(created.id).name).toBe('Example');
  });

  it('uses an injected fake repository', async () => {
    const monitor: Monitor = {
      id: randomUUID(),
      name: 'Fake Monitor',
      url: 'https://example.com',
      status: 'up',
    };

    const fakeRepository = {
      save: (input: Monitor): Monitor => input,

      findAll: (): Monitor[] => [monitor],

      findById: (id: string): Monitor | undefined =>
        id === monitor.id ? monitor : undefined,
    } satisfies MonitorRepository;

    const moduleRef = await Test.createTestingModule({
      providers: [
        MonitorsService,
        {
          provide: MONITOR_REPOSITORY,
          useValue: fakeRepository,
        },
      ],
    }).compile();

    const testedService = moduleRef.get(MonitorsService);

    expect(testedService.findAll()).toEqual([monitor]);

    expect(testedService.findOne(monitor.id)).toEqual(monitor);
  });
});
