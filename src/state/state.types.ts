import { Draft } from 'immer';

export interface State {
  /**
   * Typically BPM x 4 (on an x/4 time signature)
   */
  clockSpeed: number;
  sequences: StateSequence[];
  shortcuts: StateShortcut[];
  activeMidiInputDevices: string[];
}

export interface StateActions {
  setStep: (sequenceName: string, step: StateSequenceStep, pageNumber: number) => void;
  removeStep: (sequenceName: string, step: StateSequenceStep, pageNumber: number) => void;
  updateStep: (
    sequenceName: string,
    step: StateSequenceStep,
    pageNumber: number,
    newSequenceSettings: Partial<StateSequenceStep>
  ) => void;
  addPage: (
    sequenceName: string,
    page?: StateSequencePatternPage,
    duplicatePageByIndex?: number
  ) => void;
  removePage: (sequenceName: string, pageNumber: number) => void;
  updateChannelConfig: (
    sequenceName: string,
    channelIndex: number,
    newChannelConfig: Partial<StateSequenceChannelConfig>
  ) => void;
  updateSequence: (sequenceName: string, newSequenceSettings: Partial<StateSequence>) => void;
  addSequencePattern: (sequenceName: string, doDuplicateCurrentPattern?: boolean) => void;
  removeCurrentSequencePattern: (sequenceName: string) => void;
  setClockSpeed: (clockSpeed: number) => void;
  performAction: (actionMessage: StateActionMessage) => void;
  startListeningToNewShortcut: (shortcut: Omit<StateShortcut, 'type' | 'key'>) => void;
  stopListeningToNewShortcut: () => void;
  saveNewShortcut: (shortcut: StateShortcut) => void;
  removeShortcut: (shortcut: StateShortcut) => void;
  addActiveMidiInputDevice: (midiInputDevice: string) => void;
  removeActiveMidiInputDevice: (midiInputDevice: string) => void;
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

export type StateActionMessage =
  | StateActionMessageSequenceParameterChange
  | StateActionMessageChannelParameterChange;

type StateActionMessageSequenceParameterChange = {
  type: 'Sequence Param Change';
  sequenceName: string;
  parameter: keyof StateSequenceDrumMachine | keyof StateSequenceSynth;
  decimalPlaces?: number;
  value?: number | string | boolean;
};

type StateActionMessageChannelParameterChange = {
  type: 'Channel Param Change';
  sequenceName: string;
  channelIndex: number;
  parameter: keyof StateSequenceChannelConfig;
  value?: number | string | boolean;
};

export interface StateShortcut {
  /**
   * Action can have an undefined value, so that it's defined by the midi-note or the midi-cc
   */
  actionMessage: StateActionMessage;
  /**
   * When not set, it means it's waiting for a keyboard press or midi control, to attach a shortcut to this action
   */
  type: 'currently-being-assigned' | 'keyboard' | 'midi-note' | 'midi-cc';
  /**
   * Keyboard key that triggers the action
   */
  key?: string;
  midiDevice?: string;
  midiNote?: number;
  midiChannel?: number;
  midiControl?: number;
  /**
   * Minimum value, to be mapped to 0 when using midi-cc
   */
  valueRangeMin?: number;
  /**
   * Maximum value, to be mapped to 127 when using midi-cc
   */
  valueRangeMax?: number;
  /**
   * How many decimal places the value should be triggered with
   */
  decimalPlaces?: number;
}
