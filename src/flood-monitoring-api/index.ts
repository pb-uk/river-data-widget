const baseUrl = 'https://environment.data.gov.uk/flood-monitoring';

export const apiFetch = async (path: string, query = {}) => {
  const queryString = new URLSearchParams(query).toString();
  const uri = queryString
    ? `${baseUrl}${path}?${queryString}`
    : `${baseUrl}${path}`;
  const response = await fetch(uri);
  return [await response.json(), response];
};
