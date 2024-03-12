import { StateSequencePattern } from './state.types';

export const getBlankPattern = (): StateSequencePattern => ({ pages: [{ steps: [] }] });
