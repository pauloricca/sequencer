import { StateSequenceDrumMachine } from 'state/state.types';
import { getDefaultDrumMachine } from 'state/state.utils';

export const PRESET_909_SAMPLES: StateSequenceDrumMachine = {
  ...getDefaultDrumMachine(),
  name: '909 samples',
  channelsConfig: [
    {
      type: 'sample',
      name: 'bass drum',
      audioFile: '909/BT7A0D7.wav',
      pitch: 1,
    },
    {
      type: 'sample',
      name: 'snare drum',
      audioFile: '909/ST0T0SA.wav',
      pitch: 1,
    },
    {
      type: 'sample',
      name: 'low tom',
      audioFile: '909/LT0D0.wav',
      pitch: 1,
    },
    {
      type: 'sample',
      name: 'mid tom',
      audioFile: '909/MT0DA.wav',
      pitch: 1,
    },
    {
      type: 'sample',
      name: 'hi tom',
      audioFile: '909/HT0DA.wav',
      pitch: 1,
    },
    {
      type: 'sample',
      name: 'rim shot',
      audioFile: '909/RIM63.wav',
      pitch: 1,
    },
    {
      type: 'sample',
      name: 'hand clap',
      audioFile: '909/HANDCLP2.wav',
      pitch: 1,
    },
    {
      type: 'sample',
      name: 'closed hi hat',
      audioFile: '909/CLHH.wav',
      pitch: 1,
    },
    {
      type: 'sample',
      name: 'open hi hat',
      audioFile: '909/OPHH.wav',
      pitch: 1,
    },
    {
      type: 'sample',
      name: 'crash cymbal',
      audioFile: '909/CSHD8.wav',
      pitch: 1,
    },
    {
      type: 'sample',
      name: 'ride cymbal',
      audioFile: '909/RIDED4.wav',
      pitch: 1,
    },
  ],
};
