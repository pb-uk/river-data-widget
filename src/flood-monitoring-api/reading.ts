import { apiFetch } from './index';

export { fetchStationReadings, getReadingsLimits };

type Reading = [a: number, b: number];

const ms4Hours = 14400000;
const ms1Day = 86400000;
const fetchStationReadings = async (stationId: string) => {
  const since =
    new Date(Math.floor(Date.now() / ms4Hours) * ms4Hours - ms1Day)
      .toISOString()
      .substring(0, 19) + 'Z';
  const params = { _sorted: '', since, parameter: 'flow' };
  const [data] = await apiFetch(`/id/stations/${stationId}/readings`, params);

  const ranges = {};
  data.items.forEach(({ measure, dateTime, value }) => {
    if (ranges[measure] == null) {
      ranges[measure] = [];
    }
    ranges[measure].unshift([new Date(dateTime).valueOf() / 1000, value]);
  });

  const rangesById = {};
  Object.entries(ranges).forEach(([key, range]) => {
    rangesById[key.substring(key.lastIndexOf('/') + 1)] = range;
  });
  return rangesById;
};

const getReadingsLimits = (readings: Reading[]) => {
  if (readings.length < 1) {
    throw new Error('Readings must not be empty');
  }
  const minTime = readings[0][0];
  const maxTime = readings[readings.length - 1][0];
  let minValue = Infinity;
  let maxValue = -minValue;
  readings.forEach(([, value]) => {
    minValue = Math.min(minValue, value);
    maxValue = Math.max(maxValue, value);
  });
  return { minTime, maxTime, minValue, maxValue };
};
