export type State = {
  /**
   * Typically BPM x 4 (on an x/4 time signature)
   */
  clockSpeed: number;
  sequences: StateSequence[];
};

export type Actions = {
  setStep: (sequenceName: string) => (step: StateSequenceStep) => void;
  removeStep: (sequenceName: string) => (step: StateSequenceStep) => void;
  updateStep: (
    sequenceName: string
  ) => (
    step: StateSequenceStep
  ) => (newSequenceSettings: Partial<StateSequenceStep>) => void;
  updateChannelConfig: (
    sequenceName: string
  ) => (
    channelIndex: number
  ) => (newChannelConfig: Partial<StateSequenceChannelConfig>) => void;
  updateSequence: (
    sequenceName: string
  ) => (newSequenceSettings: Partial<StateSequence>) => void;
  setClockSpeed: (clockSpeed: number) => void;
  getSequence: (sequenceName: string) => StateSequence | undefined;
  reset: (state?: State) => void;
};

export type StateSequence = StateSequenceDrumMachine | StateSequenceSynth;

export interface StateSequenceCommon {
  name: string;
  nSteps: number;
  currentPattern: number;
  /**
   * Steps by pattern (parent array holds patterns and child arrays hold steps on that pattern)
   */
  patterns: StateSequencePattern[];
  /**
   * How many clock ticks take to advance one tick in this sequence
   */
  stepLength: number;
  midiOutDeviceName?: string;
  isMuted?: boolean;
}

export interface StateSequenceDrumMachine extends StateSequenceCommon {
  type: "drum-machine";
  channelsConfig: StateSequenceChannelConfig[];
}

export interface StateSequenceSynth extends StateSequenceCommon {
  type: "synth";
  rootNote: number;
  scale: string;
  range: number;
  noteDuration: number;
  midiChannel: number;
}

export type StateSequencePattern = {
  steps: StateSequenceStep[];
};

export type StateSequenceChannelConfig =
  | StateSequenceChannelConfigMidi
  | StateSequenceChannelConfigSample;

export interface StateSequenceChannelConfigCommon {
  name?: string;
  isHidden?: boolean;
  isMuted?: boolean;
  /**
   * 0 to 1
   */
  volume?: number;
};

export interface StateSequenceChannelConfigMidi
  extends StateSequenceChannelConfigCommon {
  type: "midi";
  midiChannel: number;
  midiNote: number;
}

export interface StateSequenceChannelConfigSample
  extends StateSequenceChannelConfigCommon {
  type: "sample";
  audioFile: string;
}

export interface StateSequenceStep extends StateSequenceStepProperties {
  channel: number;
  stepIndex: number;
}

export interface StateSequenceStepProperties {
  volume?: number;
  probability?: number;
}
