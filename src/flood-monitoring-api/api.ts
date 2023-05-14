// There is no need to be secure about this!
const baseUrl = 'http://environment.data.gov.uk/flood-monitoring';

export interface ApiResponse<T> {
  data: {
    items: T;
  };
  response: Response;
}

export interface ApiParameters {
  since?: string; // Time from.
  _sorted?: ''; // Flag for sorting.
}

export const apiFetch = async (
  path: string,
  query = {}
): Promise<ApiResponse<unknown>> => {
  const queryString = new URLSearchParams(query).toString();
  const uri = queryString
    ? `${baseUrl}${path}?${queryString}`
    : `${baseUrl}${path}`;
  const response = await fetch(uri);
  return { data: await response.json(), response };
};

/**
 * Convert a Date to a format recognized by the EA API for a query parameter.
 *
 * @param date Convert from.
 * @returns A string in the EA API query parameter format.
 */
export const toTimeParameter = (date: Date): string => {
  return date.toISOString().substring(0, 19) + 'Z';
};

/*
Useful response headers
  Date: 'Sat, 13 May 2023 09:14:07 GMT',
  last-modified: Sat, 13 May 2023 09:03:13 GMT,
Response meta:
  publisher: 'Environment Agency',
  license: 'http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
  documentation: 'http://environment.data.gov.uk/flood-monitoring/doc/reference',
  version: '0.9',
  comment: 'Status: Beta service',
  hasFormat: [
    "http://environment.data.gov.uk/flood-monitoring/id/measures/3400TH-level-stage-i-15_min-mAOD/readings.csv?_sorted=&since=2023-05-12T08%3A00%3A00Z",
    "http://environment.data.gov.uk/flood-monitoring/id/measures/3400TH-level-stage-i-15_min-mAOD/readings.rdf?_sorted=&since=2023-05-12T08%3A00%3A00Z",
    "http://environment.data.gov.uk/flood-monitoring/id/measures/3400TH-level-stage-i-15_min-mAOD/readings.ttl?_sorted=&since=2023-05-12T08%3A00%3A00Z",
    "http://environment.data.gov.uk/flood-monitoring/id/measures/3400TH-level-stage-i-15_min-mAOD/readings.html?_sorted=&since=2023-05-12T08%3A00%3A00Z"
  ],
*/
