export type MonitorStatus = 'pending' | 'up' | 'down';

export interface Monitor {
  id: string;
  name: string;
  url: string;
  status: MonitorStatus;
}
