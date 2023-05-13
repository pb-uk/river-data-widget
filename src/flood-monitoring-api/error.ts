export type FloodMonitoringApiErrorInfo = Record<string, unknown>;

export class FloodMonitoringApiError extends Error {
  public info: FloodMonitoringApiErrorInfo;

  constructor(msg: string, info: FloodMonitoringApiErrorInfo = {}) {
    super(msg);
    this.name = 'FloodMonitoringApiError';
    this.info = info;
  }
}
