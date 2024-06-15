import { StateSequenceDrumMachinePreset } from 'state/state.types';
import { getDefaultDrumMachine } from 'state/state.utils';

export const PRESET_VOLCA_DRUMS: StateSequenceDrumMachinePreset = {
  ...getDefaultDrumMachine(),
  name: 'volca drums',
  channelsConfig: [
    {
      type: 'midi',
      name: 'p1',
      midiChannel: 1,
      midiNote: 64,
    },
    {
      type: 'midi',
      name: 'p2',
      midiChannel: 2,
      midiNote: 64,
    },
    {
      type: 'midi',
      name: 'p3',
      midiChannel: 3,
      midiNote: 64,
    },
    {
      type: 'midi',
      name: 'p4',
      midiChannel: 4,
      midiNote: 64,
    },
    {
      type: 'midi',
      name: 'p5',
      midiChannel: 5,
      midiNote: 64,
    },
    {
      type: 'midi',
      name: 'p6',
      midiChannel: 6,
      midiNote: 64,
    },
  ],
};
