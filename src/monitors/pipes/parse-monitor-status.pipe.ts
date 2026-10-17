import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';

import type { MonitorStatus } from '../monitor.types.js';

@Injectable()
export class ParseMonitorStatusPipe implements PipeTransform<
  unknown,
  MonitorStatus | undefined
> {
  transform(value: unknown): MonitorStatus | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === 'pending' || value === 'up' || value === 'down') {
      return value;
    }

    throw new BadRequestException('status must be pending, up, or down');
  }
}
