import { BadRequestException } from '@nestjs/common';

import { describe, expect, it } from 'vitest';

import { ParseMonitorStatusPipe } from './parse-monitor-status.pipe.js';

describe('ParseMonitorStatusPipe', () => {
  const pipe = new ParseMonitorStatusPipe();

  it('accepts valid statuses', () => {
    expect(pipe.transform('up')).toBe('up');
    expect(pipe.transform('down')).toBe('down');
    expect(pipe.transform('pending')).toBe('pending');
  });

  it('allows an omitted status', () => {
    expect(pipe.transform(undefined)).toBeUndefined();
  });

  it('rejects an unknown status', () => {
    expect(() => pipe.transform('offline')).toThrow(BadRequestException);
  });

  it('rejects non-string values', () => {
    expect(() => pipe.transform(123)).toThrow(BadRequestException);

    expect(() => pipe.transform(['up', 'down'])).toThrow(BadRequestException);
  });
});
