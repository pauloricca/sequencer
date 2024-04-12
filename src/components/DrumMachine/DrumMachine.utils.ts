import { HIGH_PITCH_ADJUSTMENT } from './DrumMachine.constants';

/*
 * pitchParam scale from 0 (lowest), through 1 (neutral), to 2 (highest), so that we can average two pitch
 * settings (e.g. a global and a local) and cancel eachother out with opposite values.
 */
export const getAdjustedPitch = (pitchParam: number) =>
  pitchParam > 1 ? 1 + (pitchParam - 1) * HIGH_PITCH_ADJUSTMENT : pitchParam;
