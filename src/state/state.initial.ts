import { DrumMachineChannelConfig } from "components/DrumMachine/DrumMachine.types";
import { State } from "./state.types";

export const VOLCA_DRUM_MACHINE_CHANNELS: DrumMachineChannelConfig[] = [
  {
    type: "midi",
    name: "p1",
    midiChannel: 1,
    note: 64,
  },
  {
    type: "midi",
    name: "p2",
    midiChannel: 2,
    note: 64,
  },
  {
    type: "midi",
    name: "p3",
    midiChannel: 3,
    note: 64,
  },
  {
    type: "midi",
    name: "p4",
    midiChannel: 4,
    note: 64,
  },
  {
    type: "midi",
    name: "p5",
    midiChannel: 5,
    note: 64,
  },
  {
    type: "midi",
    name: "p6",
    midiChannel: 6,
    note: 64,
  },
];

export const DRUM_MACHINE_CHANNELS: DrumMachineChannelConfig[] = [
  {
    type: "midi",
    name: "kick",
    midiChannel: 10,
    note: 36,
  },
  {
    type: "midi",
    name: "snare",
    midiChannel: 10,
    note: 38,
  },
  {
    type: "midi",
    name: "lo tom",
    midiChannel: 10,
    note: 43,
  },
  {
    type: "midi",
    name: "hi tom",
    midiChannel: 10,
    note: 50,
  },
  {
    type: "midi",
    name: "cl hat",
    midiChannel: 10,
    note: 42,
  },
  {
    type: "midi",
    name: "op hat",
    midiChannel: 10,
    note: 46,
  },
  {
    type: "midi",
    name: "clap",
    midiChannel: 10,
    note: 39,
  },
  {
    type: "midi",
    name: "claves",
    midiChannel: 10,
    note: 75,
  },
  {
    type: "midi",
    name: "agogo",
    midiChannel: 10,
    note: 67,
  },
  {
    type: "midi",
    name: "crash",
    midiChannel: 10,
    note: 49,
  },
  {
    type: "sample",
    name: "SS_TCN_Kick_Solo_01",
    soundFile: "SS_TCN_Kick_Solo_01.wav",
  },
  {
    type: "sample",
    name: "SS_TCN_Kick_Solo_31",
    soundFile: "SS_TCN_Kick_Solo_31.wav",
  },
  {
    type: "sample",
    name: "SS_TCN_HH_03",
    soundFile: "SS_TCN_HH_03.wav",
  },
  {
    type: "sample",
    name: "SS_TCN_HH_05",
    soundFile: "SS_TCN_HH_05.wav",
  },
  {
    type: "sample",
    name: "SS_TCN_Clap_Snare_15",
    soundFile: "SS_TCN_Clap_Snare_15.wav",
  },
  {
    type: "sample",
    name: "SS_TCN_Clap_Snare_04",
    soundFile: "SS_TCN_Clap_Snare_04.wav",
  },
  {
    type: "sample",
    name: "GS_FREE2_Prc_01",
    soundFile: "GS_FREE2_Prc_01.wav",
  },
  {
    type: "sample",
    name: "GS_FREE2_172_ATMO_01_Cm",
    soundFile: "GS_FREE2_172_ATMO_01_Cm.wav",
  },
];

export const DRUM_MIDI_OUTPUT = "USB Uno MIDI Interface";
export const BASS_MIDI_OUTPUT = "USB2.0-MIDI Port 1";
export const SYNTH_MIDI_OUTPUT = "JT-4000 MICRO";

export const INITIAL_STATE: State = {
  clockSpeed: 120 * 16,
  sequences: [
    {
      type: "drum-machine",
      name: "drums",
      nSteps: 16,
      stepLength: 4,
      currentPattern: 0,
      patterns: [{ steps: [] }],
      channelsConfig: DRUM_MACHINE_CHANNELS,
      midiOutDeviceName: DRUM_MIDI_OUTPUT,
    },
    {
      type: "synth",
      name: "bass",
      nSteps: 16,
      stepLength: 4,
      rootNote: 60,
      noteDuration: 20,
      scale: "minor",
      range: 11,
      currentPattern: 0,
      midiChannel: 1,
      patterns: [{ steps: [] }],
      midiOutDeviceName: BASS_MIDI_OUTPUT,
    },
    {
      type: "synth",
      name: "lead",
      nSteps: 16,
      stepLength: 4,
      rootNote: 60,
      noteDuration: 20,
      scale: "minor",
      range: 11,
      currentPattern: 0,
      midiChannel: 1,
      patterns: [{ steps: [] }],
      midiOutDeviceName: SYNTH_MIDI_OUTPUT,
    },
  ],
};
