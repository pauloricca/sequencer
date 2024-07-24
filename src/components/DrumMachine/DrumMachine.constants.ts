import { SelectKnobProps } from 'components/SelectKnob/SelectKnob.types';

export const HIGH_PITCH_ADJUSTMENT = 5;
export const HIGHEST_FREQUENCY = 20000;
export const LOWEST_FREQUENCY = 20;
export const CHANNEL_TYPE_OPTIONS: SelectKnobProps['items'] = [
  { value: 'midi' },
  { value: 'midi-cc' },
  { value: 'sample' },
  { value: 'line-in' },
];
