export type StateSequence = StateSequenceCommon & (StateSequenceDrumMachine | StateSequenceSynth);

export type StateSequenceCommon = {
  name: string;
  nSteps: number;
  steps: StateSequenceStep[];
  /**
   * How many clock ticks take to advance one tick in this sequence
   */
  stepLength: number;
  midiOutDeviceName?: string;
}

export type StateSequenceDrumMachine = {
  type: "drum-machine";
  channelsConfig: StateSequenceChannelConfig[];
};

export type StateSequenceSynth = {
  type: "synth";
  middleNote: number;
  range: number;
};

export type StateSequenceChannelConfig = {
    name?: string;
    isHidden?: boolean;
  }

export interface StateSequenceStep {
  channel: number;
  stepIndex: number;
}

export type State = {
  /**
   * Typically BPM x 4
   */
  clockSpeed: number;
  sequences: StateSequence[];
};

export type Actions = {
  setStep: (sequenceName: string) => (step: StateSequenceStep) => void;
  removeStep: (sequenceName: string) => (stepIndex: StateSequenceStep) => void;
  getSequence: (sequenceName: string) => StateSequence | undefined;
  reset: () => void;
};
