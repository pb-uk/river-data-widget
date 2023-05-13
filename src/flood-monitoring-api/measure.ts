import { FloodMonitoringApiError } from './error';

export { parseMeasureId };

const parseMeasureId = (measureId: string) => {
  // ............base/ stat-paramet-qualifi- type  -interva-unit
  const regExp = /(.*)-([^-]*)-([^-]*)-([^-]*)-([^-]*)-([^-]*)$/;
  const matches = measureId.match(regExp);
  if (matches === null) {
    const e = new FloodMonitoringApiError('Cannot parse measure id');
    e.info = { measureId };
    throw e;
  }
  const [unit, interval, type, qualifier, parameter, stationId] =
    matches.reverse();
  const qualifiedParameter = qualifier.length
    ? `${parameter}-${qualifier}`
    : parameter;
  return {
    stationId,
    parameter,
    qualifier,
    type,
    interval,
    unit,
    qualifiedParameter,
  };
};
