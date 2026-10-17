import { randomUUID } from 'node:crypto';

import { Injectable, type NestMiddleware } from '@nestjs/common';

import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction): void {
    const requestId = randomUUID();

    res.setHeader('X-Request-Id', requestId);

    next();
  }
}
