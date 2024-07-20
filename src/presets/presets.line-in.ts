import { StateSequenceDrumMachinePreset } from 'state/state.types';
import { getDefaultDrumMachine } from 'state/state.utils';

export const PRESET_LINE_IN: StateSequenceDrumMachinePreset = {
  ...getDefaultDrumMachine(),
  name: 'line in',
  channelsConfig: [
    {
      type: 'line-in',
      name: 'line in',
    },
  ],
};
