import { StateSequence, StateSequenceDrumMachine, StateSequenceSynth } from 'state/state.types';
import { getDefaultSequence } from 'state/state.utils';

export const PRESETS: StateSequence[] = [
  {
    ...getDefaultSequence('drum-machine'),
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
  } as StateSequenceDrumMachine,
  {
    ...getDefaultSequence('drum-machine'),
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
  } as StateSequenceDrumMachine,
  {
    ...getDefaultSequence('drum-machine'),
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
  } as StateSequenceDrumMachine,
  {
    ...getDefaultSequence('synth'),
    name: 'synth',
  } as StateSequenceSynth,
];
