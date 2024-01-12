import { DrumMachineChannelConfig } from "src/components/DrumMachine/DrumMachine.types";
import { State } from "./state.types";

export const DRUM_MACHINE_CHANNELS: DrumMachineChannelConfig[] = [
  {
    type: "midi",
    name: "kick",
    channel: 10,
    note: 36,
  },
  {
    type: "midi",
    name: "snare",
    channel: 10,
    note: 38,
  },
  {
    type: "midi",
    name: "lo tom",
    channel: 10,
    note: 43,
  },
  {
    type: "midi",
    name: "hi tom",
    channel: 10,
    note: 50,
  },
  {
    type: "midi",
    name: "cl hat",
    channel: 10,
    note: 42,
  },
  {
    type: "midi",
    name: "op hat",
    channel: 10,
    note: 46,
  },
  {
    type: "midi",
    name: "clap",
    channel: 10,
    note: 39,
  },
  {
    type: "midi",
    name: "claves",
    channel: 10,
    note: 75,
  },
  {
    type: "midi",
    name: "agogo",
    channel: 10,
    note: 67,
  },
  {
    type: "midi",
    name: "crash",
    channel: 10,
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
    name: "SS_TCN_Clap_Snare_15",
    soundFile: "SS_TCN_Clap_Snare_15.wav",
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
    name: "SS_TCN_Clap_Snare_04",
    soundFile: "SS_TCN_Clap_Snare_04.wav",
  },
];

export const SYNTH_CHANNELS: DrumMachineChannelConfig[] = [
  {
    type: "midi",
    name: "kick",
    channel: 1,
    note: 36,
  },
  {
    type: "midi",
    name: "snare",
    channel: 1,
    note: 38,
  },
  {
    type: "midi",
    name: "lo tom",
    channel: 1,
    note: 43,
  },
  {
    type: "midi",
    name: "hi tom",
    channel: 1,
    note: 50,
  },
  {
    type: "midi",
    name: "cl hat",
    channel: 1,
    note: 42,
  },
  {
    type: "midi",
    name: "op hat",
    channel: 1,
    note: 46,
  },
  {
    type: "midi",
    name: "clap",
    channel: 1,
    note: 39,
  },
  {
    type: "midi",
    name: "claves",
    channel: 1,
    note: 75,
  },
  {
    type: "midi",
    name: "agogo",
    channel: 1,
    note: 67,
  },
  {
    type: "midi",
    name: "crash",
    channel: 1,
    note: 49,
  },
];

export const DRUM_MIDI_OUTPUT = "USB2.0-MIDI Port 1";
export const SYNTH_MIDI_OUTPUT = "JT-4000 MICRO";

export const INITIAL_STATE: State = {
  clockSpeed: 120 * 16,
  sequences: [
    {
      type: "drum-machine",
      name: "drums",
      nSteps: 16,
      stepLength: 4,
      steps: [],
      channelsConfig: DRUM_MACHINE_CHANNELS,
      midiOutDeviceName: DRUM_MIDI_OUTPUT,
    },
  ],
};
