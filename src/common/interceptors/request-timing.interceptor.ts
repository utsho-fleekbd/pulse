import { performance } from 'node:perf_hooks';

import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';

import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';

@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse<Response>();

    const startedAt = performance.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.setTimingHeader(response, startedAt);
        },
        error: () => {
          this.setTimingHeader(response, startedAt);
        },
      }),
    );
  }

  private setTimingHeader(response: Response, startedAt: number): void {
    if (response.headersSent) {
      return;
    }

    const duration = (performance.now() - startedAt).toFixed(2);

    response.setHeader('X-Response-Time', `${duration}ms`);
  }
}
