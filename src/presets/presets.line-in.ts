import { StateSequenceLineIn } from 'state/state.types';
import { getDefaultLineIn } from 'state/state.utils';

export const PRESET_LINE_IN: StateSequenceLineIn = {
  ...getDefaultLineIn(),
  name: 'line in',
};
