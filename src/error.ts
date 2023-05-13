export type RiverDataWidgetErrorInfo = Record<string, unknown>;

export class RiverDataWidgetError extends Error {
  public info: RiverDataWidgetErrorInfo;

  constructor(msg: string, info: RiverDataWidgetErrorInfo = {}) {
    super(msg);
    this.name = 'RiverDataWidgetError';
    this.info = info;
  }
}
