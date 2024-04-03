import { StateSequenceStepProperties } from 'state/state.types';

export const DEFAULT_STEP_VALUES: StateSequenceStepProperties = {
  mutability: 0.5,
  pitch: 1,
  probability: 1,
  volume: 1,
};

export const MAX_STEP_VALUES: StateSequenceStepProperties = {
  mutability: 1,
  pitch: 2,
  probability: 1,
  volume: 1,
};
