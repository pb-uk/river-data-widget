import { apiFetch } from './index';

export type Reading = [
  // Unix epoch timestamp (seconds).
  timestamp: number,
  // Value.
  value: number
];

type ReadingDTO = {
  '@id': string; // The URL of this reading.
  dateTime: string; // ISO time (with 'Z' time zone).
  measure: string; // The URL of the measure.
  value: number; // The value in the appropriate units.
};

const ms4Hours = 14400000;
const ms1Day = 86400000;

/**
 * Fetch the readings for a measure.
 *
 * @todo Caching and throttling.
 *
 * @param id The EA measure id.
 * @returns An array of readings for the measure.
 */
export const fetchMeasureReadings = async (id: string): Promise<Reading[]> => {
  // Set the parameters for the request.
  const since =
    new Date(Math.floor(Date.now() / ms4Hours) * ms4Hours - ms1Day)
      .toISOString()
      .substring(0, 19) + 'Z';
  const params = { _sorted: '', since };
  const [data] = await apiFetch(`/id/measures/${id}/readings`, params);

  return parseReadings(data.items)[id];
};

/**
 * Fetch the readings for a station.
 *
 * @todo Remove flow hard coding.
 * @todo Caching and throttling.
 *
 * @param id The EA measure id.
 * @returns An array of readings for the measure.
 */
export const fetchStationReadings = async (
  stationId: string
): Promise<Record<string, Reading[]>> => {
  // @TODO caching and throttling.
  const since =
    new Date(Math.floor(Date.now() / ms4Hours) * ms4Hours - ms1Day)
      .toISOString()
      .substring(0, 19) + 'Z';
  const params = { _sorted: '', since, parameter: 'flow' };
  const [data] = await apiFetch(`/id/stations/${stationId}/readings`, params);
  return parseReadings(data.items);
};

export const getReadingsLimits = (readings: Reading[]) => {
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

const parseReadings = (items: ReadingDTO[]): Record<string, Reading[]> => {
  const ranges: Record<string, Reading[]> = {};
  items.forEach(({ measure, dateTime, value }) => {
    if (ranges[measure] == null) {
      ranges[measure] = [];
    }
    ranges[measure].unshift([new Date(dateTime).valueOf() / 1000, value]);
  });

  const rangesById: Record<string, Reading[]> = {};
  Object.entries(ranges).forEach(([key, range]) => {
    rangesById[key.substring(key.lastIndexOf('/') + 1)] = range;
  });

  return rangesById;
};
