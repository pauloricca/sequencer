import { State, StateSequenceChannelConfig } from './state.types';
import { getDefaultPattern } from './state.utils';

export const VOLCA_DRUM_MACHINE_CHANNELS: StateSequenceChannelConfig[] = [
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
];

export const DRUM_MACHINE_CHANNELS: StateSequenceChannelConfig[] = [
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
  {
    type: 'sample',
    name: 'SS_TCN_Kick_Solo_01',
    audioFile: 'SS_TCN_Kick_Solo_01.wav',
    pitch: 1,
  },
  {
    type: 'sample',
    name: 'SS_TCN_Kick_Solo_31',
    audioFile: 'SS_TCN_Kick_Solo_31.wav',
    pitch: 1,
  },
  {
    type: 'sample',
    name: 'SS_TCN_HH_03',
    audioFile: 'SS_TCN_HH_03.wav',
    pitch: 1,
  },
  {
    type: 'sample',
    name: 'SS_TCN_HH_05',
    audioFile: 'SS_TCN_HH_05.wav',
    pitch: 1,
  },
  {
    type: 'sample',
    name: 'SS_TCN_Clap_Snare_15',
    audioFile: 'SS_TCN_Clap_Snare_15.wav',
    pitch: 1,
  },
  {
    type: 'sample',
    name: 'SS_TCN_Clap_Snare_04',
    audioFile: 'SS_TCN_Clap_Snare_04.wav',
    pitch: 1,
  },
  {
    type: 'sample',
    name: 'GS_FREE2_Prc_01',
    audioFile: 'GS_FREE2_Prc_01.wav',
    pitch: 1,
  },
  {
    type: 'sample',
    name: 'GS_FREE2_172_ATMO_01_Cm',
    audioFile: 'GS_FREE2_172_ATMO_01_Cm.wav',
    pitch: 1,
  },
];

export const DRUM_MIDI_OUTPUT = 'USB Uno MIDI Interface';
export const BASS_MIDI_OUTPUT = 'USB2.0-MIDI Port 1';
export const SYNTH_MIDI_OUTPUT = 'JT-4000 MICRO';

export const INITIAL_STATE: State = {
  version: 3,
  isPlaying: false,
  clockSpeed: 130 * 4,
  swing: 0.5,
  sequences: [
    {
      type: 'drum-machine',
      id: 'drums',
      name: 'drums',
      nSteps: 16,
      stepLength: 1,
      currentPattern: 0,
      patterns: [getDefaultPattern()],
      channelsConfig: DRUM_MACHINE_CHANNELS,
      midiOutDeviceName: DRUM_MIDI_OUTPUT,
    },
    {
      type: 'synth',
      id: 'bass',
      name: 'bass',
      nSteps: 16,
      stepLength: 1,
      rootNote: 60,
      transpose: 0,
      noteDuration: 1,
      scale: 'minor',
      range: 11,
      currentPattern: 0,
      midiChannel: 1,
      patterns: [getDefaultPattern()],
      midiOutDeviceName: BASS_MIDI_OUTPUT,
      isPolyphonic: true,
    },
    {
      type: 'synth',
      id: 'lead',
      name: 'lead',
      nSteps: 16,
      stepLength: 1,
      rootNote: 60,
      transpose: 0,
      noteDuration: 1,
      scale: 'minor',
      range: 11,
      currentPattern: 0,
      midiChannel: 1,
      patterns: [getDefaultPattern()],
      midiOutDeviceName: SYNTH_MIDI_OUTPUT,
      isPolyphonic: true,
    },
  ],
  controlShortcuts: {
    shortcuts: [],
    activeMidiInputDevices: [],
  },
};
