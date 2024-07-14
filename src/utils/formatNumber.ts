export const formatNumber =
  ({ decimalPlaces = 1, multiplier = 1, preffix = '', suffix = '' }) =>
  (value: number) =>
    `${preffix}${(value * multiplier).toFixed(decimalPlaces)}${suffix}`;

export const formatPercentage = formatNumber({ suffix: '%', multiplier: 100 });
export const formatSeconds = formatNumber({ decimalPlaces: 2, suffix: 's' });
