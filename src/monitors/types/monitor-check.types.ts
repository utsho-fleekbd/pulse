import { CheckResult } from '../../checks/types/check-result.types.js';

export type MonitorCheck = CheckResult & {
  id: string;
  monitorId: string;
};
