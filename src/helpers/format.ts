export const FONT_STACK =
  '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue",Arial,sans-serif';

export const round3 = (value: number) =>
  value < 100 ? value.toPrecision(2) : Math.round(value).toString();
