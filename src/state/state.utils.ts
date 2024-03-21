import { StateSequencePattern } from './state.types';

export const getBlankPattern = (): StateSequencePattern => ({ pages: [{ steps: [] }] });

export const getIntervalFromClockSpeed = (clockSpeed: number) => 60000 / clockSpeed;
