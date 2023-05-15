export const MINUTE_MS = 60000;
// const HOUR_MS = 3600000;
export const DAY_MS = 86400000;

/**
 * Get the Date at the start of a day in UTC or local time.
 *
 * @param offset
 * @param timeZone The time zone offset in minutes, or set to `true` to use the
 *                 local time zone (`false`, the default, uses UTC).
 * @returns The reqested date.
 */
export const startOfDay = (
  offset = 0,
  timeZone: boolean | number = false
): Date => {
  if (timeZone === false) {
    // Use UTC.
    return new Date(Math.floor(Date.now() / DAY_MS + offset) * DAY_MS);
  }

  const now = new Date();
  const tz = timeZone === true ? now.getTimezoneOffset() : timeZone;
  const local = now.valueOf() + tz * MINUTE_MS;
  return new Date(Math.floor(local / DAY_MS + offset) * DAY_MS);
};

/**
 * |         | long        |short|narrow|numeric|2-digit|
 * |:-------:|:-----------:|:---:|:----:|:-----:|:-----:|
 * | weekday | Monday      | Mon |   M  |       |       |
 * | era     | Anno Domini | AD  |   A  |       |       |
 * | year    |             |     |      | 2012  |  12   |
 * | month   | March       | Mar |   M  |   3   |  03   |
 * | day     |             |     |      |   1   |  01   |
 * | hour    |             |     |      |   1   |  01   |
 * | minute  |             |     |      |   1   |  01   |
 * | second  |             |     |      |   1   |  01   |
 *
 * * fractionalSecondDigits: 1, 2 or 3 for number of digits.
 * * timeZoneName: long (Pacific Standard Time), short (PST),
 *   longOffset (GMT-0800), shortOffset (GMT-8), longGeneric (Pacific Time),
 *   shortGeneric (PT).
 */

export const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'short',
});
