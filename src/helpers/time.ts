export const MINUTE_MS = 60000;
// const HOUR_MS = 3600000;
export const DAY_MS = 86400000;

export const startOfDay = (
  offset = 0,
  utcOrTz: boolean | number = false
): Date => {
  if (utcOrTz === true) {
    return new Date(Math.floor(Date.now() / DAY_MS + offset) * DAY_MS);
  }
  const now = new Date();
  const tz = utcOrTz || now.getTimezoneOffset(); // in minutes.
  const local = now.valueOf() + tz * MINUTE_MS;
  return new Date(Math.floor(local / DAY_MS + offset) * DAY_MS);
};
