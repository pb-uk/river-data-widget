export { apiFetch, FloodMonitoringApiError };

const baseUrl = 'https://environment.data.gov.uk/flood-monitoring';

const getReadingsLimits = (readings) => {
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

const apiFetch = async (path, query = {}) => {
  const queryString = new URLSearchParams(query).toString();
  const uri = queryString
    ? `${baseUrl}${path}?${queryString}`
    : `${baseUrl}${path}`;
  const response = await fetch(uri);
  return [await response.json(), response];
};

class FloodMonitoringApiError extends Error {
  public info: Record<string, unknown> = {};
}
