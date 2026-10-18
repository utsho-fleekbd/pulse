export type CheckResult =
  | {
      status: 'up';
      statusCode: number;
      responseTimeMs: number;
      checkedAt: Date;
    }
  | {
      status: 'down';
      statusCode: number | null;
      reason: 'unhealthy_status' | 'timeout' | 'network_error';
      responseTimeMs: number;
      checkedAt: Date;
    };
