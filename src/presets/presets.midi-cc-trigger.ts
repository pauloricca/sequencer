import { StateSequenceDrumMachinePreset } from 'state/state.types';
import { getDefaultDrumMachine } from 'state/state.utils';

export const PRESET_MIDI_CC_TRIGGER: StateSequenceDrumMachinePreset = {
  ...getDefaultDrumMachine(),
  name: 'midi cc trigger',
  stepLength: 16,
  channelsConfig: [
    {
      type: 'midi-cc',
      name: 'ch 1 cc 1',
      midiChannel: 1,
      midiCC: 1,
    },
    {
      type: 'midi-cc',
      name: 'ch 1 cc 2',
      midiChannel: 1,
      midiCC: 2,
    },
    {
      type: 'midi-cc',
      name: 'ch 1 cc 3',
      midiChannel: 1,
      midiCC: 3,
    },
    {
      type: 'midi-cc',
      name: 'ch 1 cc 4',
      midiChannel: 1,
      midiCC: 4,
    },
    {
      type: 'midi-cc',
      name: 'ch 1 cc 5',
      midiChannel: 1,
      midiCC: 5,
    },
    {
      type: 'midi-cc',
      name: 'ch 1 cc 5',
      midiChannel: 1,
      midiCC: 5,
    },
    {
      type: 'midi-cc',
      name: 'ch 1 cc 6',
      midiChannel: 1,
      midiCC: 6,
    },
    {
      type: 'midi-cc',
      name: 'ch 1 cc 6',
      midiChannel: 1,
      midiCC: 6,
    },
  ],
};
