import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { MonitorsService } from './monitors.service.js';
import { MONITOR_REPOSITORY, MonitorRepository } from './monitor.repository.js';
import { InMemoryMonitorRepository } from './in-memory-monitor.repository.js';
import { Monitor } from './monitor.types.js';
import { randomUUID } from 'node:crypto';
import { ChecksService } from '../checks/checks.service.js';
import { MonitorsModule } from './monitors.module.js';
import { ChecksModule } from '../checks/checks.module.js';

describe('MonitorService', () => {
  let service: MonitorsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ChecksModule],
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
      imports: [ChecksModule],
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

  it('updates monitor status after a check', async () => {
    const check = vi.fn<ChecksService['check']>();

    check.mockResolvedValueOnce({
      status: 'down',
      statusCode: 503,
      reason: 'unhealthy_status',
      responseTimeMs: 120,
      checkedAt: new Date(),
    });

    const moduleRef = await Test.createTestingModule({
      imports: [MonitorsModule],
    })
      .overrideProvider(MONITOR_REPOSITORY)
      .useClass(InMemoryMonitorRepository)
      .overrideProvider(ChecksService)
      .useValue({ check })
      .compile();

    try {
      const service = moduleRef.get(MonitorsService);

      const monitor = service.create({
        name: 'Example',
        url: 'https://example.com',
      });

      expect(monitor.status).toBe('pending');

      const result = await service.checkNow(monitor.id);

      expect(result.status).toBe('down');
      expect(check).toHaveBeenCalledWith(monitor.url);

      const updated = service.findOne(monitor.id);

      expect(updated.status).toBe('down');
    } finally {
      await moduleRef.close();
    }
  });
});
