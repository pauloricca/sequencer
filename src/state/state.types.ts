import { Draft } from 'immer';

export interface State {
  /**
   * Typically BPM x 4 (on an x/4 time signature)
   */
  clockSpeed: number;
  sequences: StateSequence[];
}

export interface StateActions {
  setStep: (sequenceName: string) => (step: StateSequenceStep, pageNumber: number) => void;
  removeStep: (sequenceName: string) => (step: StateSequenceStep, pageNumber: number) => void;
  updateStep: (
    sequenceName: string
  ) => (
    step: StateSequenceStep,
    pageNumber: number
  ) => (newSequenceSettings: Partial<StateSequenceStep>) => void;
  addPage: (sequenceName: string) => (page?: StateSequencePatternPage) => void;
  removePage: (sequenceName: string) => (pageNumber: number) => void;
  updateChannelConfig: (
    sequenceName: string
  ) => (channelIndex: number) => (newChannelConfig: Partial<StateSequenceChannelConfig>) => void;
  updateSequence: (sequenceName: string) => (newSequenceSettings: Partial<StateSequence>) => void;
  setClockSpeed: (clockSpeed: number) => void;
  reset: (state?: State) => void;
}

type StateSetter = (
  nextStateOrUpdater:
    | (State & StateActions)
    | Partial<State & StateActions>
    | ((state: Draft<State & StateActions>) => void),
  shouldReplace?: boolean | undefined
) => void;

type StateGetter = () => State & StateActions;

export type StateAction = (set: StateSetter, get: StateGetter) => any;

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
  type: 'drum-machine';
  channelsConfig: StateSequenceChannelConfig[];
}

export interface StateSequenceSynth extends StateSequenceCommon {
  type: 'synth';
  rootNote: number;
  scale: string;
  range: number;
  noteDuration: number;
  midiChannel: number;
  isPolyphonic: boolean;
}

export interface StateSequencePattern {
  pages: StateSequencePatternPage[];
}

export interface StateSequencePatternPage {
  steps: StateSequenceStep[];
}

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
}

export interface StateSequenceChannelConfigMidi extends StateSequenceChannelConfigCommon {
  type: 'midi';
  midiChannel: number;
  midiNote: number;
  /**
   * In some drum machines the volume is controlled by sending a cc message instead of velocity
   */
  volumeCC?: number;
}

export interface StateSequenceChannelConfigSample extends StateSequenceChannelConfigCommon {
  type: 'sample';
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
