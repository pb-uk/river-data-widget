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

const measureTranslations: Record<string, Record<string, string>> = {
  unit: {
    m3_s: 'm<sup>3</sup>/s',
    mAOD: 'm',
  },
  qualifiedParameter: {
    'level-stage': 'level',
    'level-downstream': 'downstream level',
  },
};

export const translateMeasureProperties = (measure: Record<string, string>) => {
  const translated: Record<string, string> = {};
  for (const prop in measure) {
    const value = measure[prop];
    if (measureTranslations[prop] && measureTranslations[prop][value]) {
      translated[prop] = measureTranslations[prop][value];
    } else {
      translated[prop] = value;
    }
  }
  return translated;
};
