import { StateSequenceDrumMachinePreset } from 'state/state.types';
import { getDefaultDrumMachine } from 'state/state.utils';

export const PRESET_VOLCA_BEATS: StateSequenceDrumMachinePreset = {
  ...getDefaultDrumMachine(),
  name: 'volca beats',
  channelsConfig: [
    {
      type: 'midi',
      name: 'kick',
      midiChannel: 10,
      midiNote: 36,
      volumeCC: 40,
    },
    {
      type: 'midi',
      name: 'snare',
      midiChannel: 10,
      midiNote: 38,
      volumeCC: 41,
    },
    {
      type: 'midi',
      name: 'lo tom',
      midiChannel: 10,
      midiNote: 43,
      volumeCC: 42,
    },
    {
      type: 'midi',
      name: 'hi tom',
      midiChannel: 10,
      midiNote: 50,
      volumeCC: 43,
    },
    {
      type: 'midi',
      name: 'cl hat',
      midiChannel: 10,
      midiNote: 42,
      volumeCC: 44,
    },
    {
      type: 'midi',
      name: 'op hat',
      midiChannel: 10,
      midiNote: 46,
      volumeCC: 45,
    },
    {
      type: 'midi',
      name: 'clap',
      midiChannel: 10,
      midiNote: 39,
      volumeCC: 46,
    },
    {
      type: 'midi',
      name: 'claves',
      midiChannel: 10,
      midiNote: 75,
      volumeCC: 47,
    },
    {
      type: 'midi',
      name: 'agogo',
      midiChannel: 10,
      midiNote: 67,
      volumeCC: 48,
    },
    {
      type: 'midi',
      name: 'crash',
      midiChannel: 10,
      midiNote: 49,
      volumeCC: 49,
    },
  ],
};
