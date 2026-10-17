export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}
