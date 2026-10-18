import { Test } from '@nestjs/testing';
import type { LoggerService } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { MonitorsScheduler } from './monitors.scheduler.js';
import { MonitorsService } from './monitors.service.js';

describe('MonitorsScheduler', () => {
  it('checks all monitors, even if one fails', async () => {
    const findAll = vi.fn<MonitorsService['findAll']>();

    findAll.mockReturnValue([
      {
        id: 'monitor-1',
        name: 'First',
        url: 'https://example.com',
        status: 'pending',
      },
      {
        id: 'monitor-2',
        name: 'Second',
        url: 'https://api.github.com',
        status: 'pending',
      },
    ]);

    const checkNow = vi.fn<MonitorsService['checkNow']>();

    checkNow
      .mockRejectedValueOnce(new Error('Unexpected failure'))
      .mockResolvedValueOnce({
        status: 'up',
        statusCode: 200,
        responseTimeMs: 100,
        checkedAt: new Date(),
      });

    const mockLogger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      verbose: vi.fn(),
      fatal: vi.fn(),
    } satisfies LoggerService;

    const moduleRef = await Test.createTestingModule({
      providers: [
        MonitorsScheduler,
        {
          provide: MonitorsService,
          useValue: { findAll, checkNow },
        },
      ],
    })
      .setLogger(mockLogger)
      .compile();

    try {
      const scheduler = moduleRef.get(MonitorsScheduler);

      await scheduler.runChecks();

      expect(findAll).toHaveBeenCalledOnce();
      expect(checkNow).toHaveBeenCalledTimes(2);
      expect(checkNow).toHaveBeenNthCalledWith(1, 'monitor-1');
      expect(checkNow).toHaveBeenNthCalledWith(2, 'monitor-2');
    } finally {
      await moduleRef.close();
    }
  });
});
