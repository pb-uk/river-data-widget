export class FloodMonitoringApiError extends Error {
  public info: Record<string, unknown>;

  constructor(msg: string, info: Record<string, unknown> = {}) {
    super(msg);
    this.name = 'FloodMonitoringApiError';
    this.info = info;
  }
}
