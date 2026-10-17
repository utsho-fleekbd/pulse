import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { MonitorsService } from './monitors.service.js';

describe('MonitorService', () => {
  let service: MonitorsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MonitorsService],
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
});
