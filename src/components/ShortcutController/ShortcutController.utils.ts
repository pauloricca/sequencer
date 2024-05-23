export const hasInputInFocus = () => document.activeElement?.tagName.toLowerCase() === 'input';

/**
 * Given a number of decimal places (undefined, 0, 1, 2, 3), returns the increment step (1, 1, 0.1, 0.01, 0.001)
 */
export const getStepFromDecimalPlaces = (decimalPlaces: number | undefined) =>
  1 / Math.pow(10, decimalPlaces ?? 0) || 1;
