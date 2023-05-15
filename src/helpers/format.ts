export const round3 = (value: number) =>
  value < 100 ? value.toPrecision(2) : Math.round(value).toString();
