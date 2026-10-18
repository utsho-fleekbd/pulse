import { BadRequestException } from '@nestjs/common';
import { HttpClientModule } from '@nestjs/http-client';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChecksModule } from './checks.module.js';
import { ChecksService } from './checks.service.js';

describe('ChecksService', () => {
  const fetchMock = vi.fn<typeof globalThis.fetch>();

  let moduleRef: TestingModule;
  let service: ChecksService;

  beforeEach(async () => {
    fetchMock.mockReset();

    moduleRef = await Test.createTestingModule({
      imports: [HttpClientModule.forRoot({ fetch: fetchMock }), ChecksModule],
    }).compile();

    await moduleRef.init();
    service = moduleRef.get(ChecksService);
  });

  afterEach(async () => {
    vi.useRealTimers();
    await moduleRef.close();
  });

  it('returns up for HTTP 200', async () => {
    fetchMock.mockResolvedValueOnce(new Response('OK', { status: 200 }));

    const result = await service.check('https://example.com');

    expect(result).toMatchObject({
      status: 'up',
      statusCode: 200,
    });

    expect(result.checkedAt).toBeInstanceOf(Date);
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns up for HTTP 204', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(service.check('https://example.com')).resolves.toMatchObject({
      status: 'up',
      statusCode: 204,
    });
  });

  it('returns down for HTTP 503 without retrying', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));

    await expect(service.check('https://example.com')).resolves.toMatchObject({
      status: 'down',
      statusCode: 503,
      reason: 'unhealthy_status',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('classifies network failures', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(service.check('https://example.com')).resolves.toMatchObject({
      status: 'down',
      statusCode: null,
      reason: 'network_error',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('classifies request timeouts', async () => {
    vi.useFakeTimers();

    fetchMock.mockImplementationOnce(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(init.signal?.reason),
            { once: true },
          );
        }),
    );

    const resultPromise = service.check('https://example.com');

    await vi.advanceTimersByTimeAsync(3_001);

    await expect(resultPromise).resolves.toMatchObject({
      status: 'down',
      statusCode: null,
      reason: 'timeout',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    'http://example.com',
    'https://localhost',
    'https://127.0.0.1',
    'https://unknown.example',
    'https://example.com:8443',
    'https://user:password@example.com',
  ])('rejects disallowed target %s', async (url) => {
    await expect(service.check(url)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('propagates unexpected errors', async () => {
    const unexpected = new Error('Body cleanup failed');

    const body = new ReadableStream({
      cancel() {
        throw unexpected;
      },
    });

    fetchMock.mockResolvedValueOnce(new Response(body, { status: 200 }));

    await expect(service.check('https://example.com')).rejects.toBe(unexpected);
  });
});
