import { BadRequestException, Injectable } from '@nestjs/common';
import {
  HttpClient,
  HttpNetworkError,
  HttpTimeoutError,
} from '@nestjs/http-client';

import type { CheckResult } from './types/check-result.types.js';

const ALLOWED_HOSTS = new Set(['example.com', 'api.github.com']);

@Injectable()
export class ChecksService {
  constructor(private readonly http: HttpClient) {}

  async check(url: string): Promise<CheckResult> {
    const target = this.validateTarget(url);
    const startedAt = performance.now();

    try {
      const { status, ok, data } = await this.http.get(target.href, {
        responseType: 'response',
      });

      const responseTimeMs = Math.round(performance.now() - startedAt);

      // We only need headers. Release the response body.
      await data.body?.cancel();

      const checkedAt = new Date();

      if (ok) {
        return {
          status: 'up',
          statusCode: status,
          responseTimeMs,
          checkedAt,
        };
      }

      return {
        status: 'down',
        statusCode: status,
        reason: 'unhealthy_status',
        responseTimeMs,
        checkedAt,
      };
    } catch (error: unknown) {
      const responseTimeMs = Math.round(performance.now() - startedAt);
      const checkedAt = new Date();

      if (error instanceof HttpTimeoutError) {
        return {
          status: 'down',
          statusCode: null,
          reason: 'timeout',
          responseTimeMs,
          checkedAt,
        };
      }

      if (error instanceof HttpNetworkError) {
        return {
          status: 'down',
          statusCode: null,
          reason: 'network_error',
          responseTimeMs,
          checkedAt,
        };
      }

      throw error;
    }
  }

  private validateTarget(value: string): URL {
    let url: URL;

    try {
      url = new URL(value);
    } catch {
      throw new BadRequestException('Invalid monitor URL');
    }

    if (
      url.protocol !== 'https:' ||
      url.username !== '' ||
      url.password !== '' ||
      url.port !== '' ||
      !ALLOWED_HOSTS.has(url.hostname)
    ) {
      throw new BadRequestException('Monitor target is not allowed');
    }

    return url;
  }
}
