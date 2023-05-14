import { apiFetch, toTimeParameter } from './api';
import { useStore } from './store';

import type { ApiParameters, ApiResponse } from './api';

/**
 * Internal format for readings.
 */
export type Reading = [
  timestamp: number, // Unix epoch timestamp (seconds).
  value: number // Value.
];

/**
 * Internal format for readings.
 */
export interface ReadingOptions {
  since?: Date; // Time from.
}

/**
 * Internal format for readings.
 */
type ReadingResponse = [a: Reading[], b: ApiResponse<ReadingDTO[]>];

/**
 * Data transfer object for readings provided by the API.
 */
interface ReadingDTO {
  '@id': string; // The URL of this reading.
  dateTime: string; // e.g. '2023-05-13T09:00:00Z'.
  measure: string; // The URL of the measure.
  value: number; // The value in the appropriate units.
}

/**
 * Fetch the readings for a measure.
 *
 * @param id The EA measure id.
 * @returns A promise for an array of readings for the measure.
 */
export const fetchMeasureReadings = async (
  id: string,
  options: ReadingOptions = {}
): Promise<ReadingResponse> => {
  // Set the parameters for the request.
  const params: ApiParameters = { _sorted: '' };
  if (options.since) {
    params.since = toTimeParameter(options.since);
  }
  // Get the response, casting the items to ReadingDTOs.
  const response = <ApiResponse<ReadingDTO[]>>(
    await apiFetch(`/id/measures/${id}/readings`, params)
  );
  return [parseReadings(response.data.items)[id], response];
};

/**
 * Get the readings for a measure.
 *
 * @todo Caching and throttling.
 *
 * @param id The EA measure id.
 * @returns A promise for an array of readings for the measure.
 */
export const getMeasureReadings = async (
  id: string,
  options: ReadingOptions = {}
): Promise<Reading[]> => {
  // const store = useStore();
  // Get the last set of readings reported.
  // const readings = store.get(`readings|id`);
  // if (readings !== null) {
  const [readings] = await fetchMeasureReadings(id, options);
  return readings;
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

export const parseReadings = (
  items: ReadingDTO[]
): Record<string, Reading[]> => {
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
