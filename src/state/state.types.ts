export type StateSequence = StateSequenceCommon &
  (StateSequenceDrumMachine | StateSequenceSynth);

export type StateSequencePattern = {
  steps: StateSequenceStep[];
}

export type StateSequenceCommon = {
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
};

export type StateSequenceDrumMachine = {
  type: "drum-machine";
  channelsConfig: StateSequenceChannelConfig[];
};

export type StateSequenceSynth = {
  type: "synth";
  rootNote: number;
  scale: string;
  range: number;
};

export type StateSequenceChannelConfig = {
  name?: string;
  isHidden?: boolean;
};

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
  updateSequence: (
    sequenceName: string
  ) => (newSequenceSettings: Partial<StateSequence>) => void;
  getSequence: (sequenceName: string) => StateSequence | undefined;
  reset: () => void;
};
