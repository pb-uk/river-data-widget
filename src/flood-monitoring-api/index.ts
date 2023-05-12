export { apiFetch, FloodMonitoringApiError };

const baseUrl = 'https://environment.data.gov.uk/flood-monitoring';

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
