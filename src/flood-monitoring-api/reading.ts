import { apiFetch, toTimeParameter } from './api';
import { useStore } from './store';
import { MINUTE_MS, startOfDay } from '../helpers/time';

import type { ApiParameters, ApiResponse } from './api';

// Throttle requests to five minutes.
const THROTTLE_MS = 5 * MINUTE_MS;

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
export interface ReadingDTO {
  '@id': string; // The URL of this reading.
  dateTime: string; // e.g. '2023-05-13T09:00:00Z'.
  measure: string; // The URL of the measure.
  // See https://github.com/pb-uk/river-data-widget/issues/5.
  value?: unknown; // The value in the appropriate units.
}

interface StoredReadings {
  storedSince: number;
  lastCheck: number;
  data: Reading[];
}

/**
 * Fetch the readings for a measure.
 *
 * @param id The EA measure id.
 * @returns A promise for an array of readings for the measure.
 */
const fetchMeasureReadings = async (
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
  return [parseReadings(response.data.items)[id] || [], response];
};

export const filterSince = (data: Reading[], since: number) => {
  const position = data.findIndex((reading) => reading[0] >= since);
  return position < 0 ? [] : data.slice(position);
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
  // Get the saved readings.
  const key = `readings|${id}`;
  const store = useStore();

  const stored: StoredReadings = store.get(key) || {
    data: [],
    lastCheck: 0,
    storedSince: Infinity,
  };
  const { data, lastCheck } = stored;
  let { storedSince } = stored;

  const discardBefore = startOfDay(null, -8, true).valueOf() / 1000;

  // Discard any older than 30 days.
  while (data.length && data[0][0] < discardBefore) {
    [storedSince] = data[0];
    data.shift();
  }

  // If we have data early enough apply throttle.
  const lastStored = data.length ? data[data.length - 1][0] : 0;
  const requestedSince = (options.since && options.since.valueOf() / 1000) || 0;
  if (
    storedSince <= requestedSince &&
    Date.now() < lastCheck * 1000 + THROTTLE_MS
  ) {
    // Throttled.
    return filterSince(data, requestedSince);
  }

  const fetchOptions: ReadingOptions = {
    ...options,
    since: new Date(Math.max(requestedSince, lastStored) * 1000),
  };

  const [newData] = await fetchMeasureReadings(id, fetchOptions);
  mergeReadings(data, newData);
  storedSince = Math.min(requestedSince, storedSince);
  store.set(key, { lastCheck: Date.now() / 1000, data, storedSince });
  return filterSince(data, requestedSince);
};

export const mergeReadings = (first: Reading[], second: Reading[]): void => {
  if (!second.length) return;

  let firstPos = first.length - 1;
  while (firstPos >= 0 && first[firstPos][0] >= second[0][0]) {
    --firstPos;
  }
  first.splice(firstPos + 1, Infinity, ...second);
};

export const parseReadings = (
  items: ReadingDTO[]
): Record<string, Reading[]> => {
  const ranges: Record<string, Reading[]> = {};
  for (const { measure, dateTime, value } of items) {
    if (ranges[measure] == null) {
      ranges[measure] = [];
    }
    // Ignore missing or unexpected values - see
    // https://github.com/pb-uk/river-data-widget/issues/5
    if (typeof value === 'number' && !isNaN(value)) {
      ranges[measure].unshift([new Date(dateTime).valueOf() / 1000, value]);
    }
  }

  const rangesById: Record<string, Reading[]> = {};
  for (const [key, range] of Object.entries(ranges)) {
    rangesById[key.substring(key.lastIndexOf('/') + 1)] = range;
  }

  return rangesById;
};
