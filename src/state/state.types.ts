import { Draft } from 'immer';

export interface State {
  /**
   * Keep track of app/state versions so that we can import and convert older exported states
   */
  version: number;
  isPlaying: boolean;
  /**
   * Typically BPM x 4 (on an x/4 time signature)
   */
  clockSpeed: number;
  /**
   * 0.5 - 0.95
   */
  swing: number;
  sequences: StateSequence[];
  controlShortcuts: {
    shortcuts: StateShortcut[];
    /**
     * Devices being listened to when creating new / editing shortcuts.
     * Any new note or cc input from these devices will be used to assign controller.
     */
    activeMidiInputDevices: string[];
  };
}

export interface StateActions {
  // Global
  addSequence: (sequencePreset: StateSequencePreset) => void;
  removeSequence: (sequenceId: string) => void;
  updateSequenceOrder: (oldIndex: number, newIndex: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setClockSpeed: (clockSpeed: number) => void;
  setSwing: (swing: number) => void;
  reset: (state?: State) => void;

  // Sequence
  setStep: (sequenceId: string, step: StateSequenceStep, pageNumber: number) => void;
  removeStep: (sequenceId: string, step: StateSequenceStep, pageNumber: number) => void;
  updateStep: (
    sequenceId: string,
    step: StateSequenceStep,
    pageNumber: number,
    newSequenceSettings: Partial<StateSequenceStep>
  ) => void;
  addPage: (
    sequenceId: string,
    page?: StateSequencePatternPage,
    duplicatePageByIndex?: number
  ) => void;
  removePage: (sequenceId: string, pageNumber: number) => void;
  updatePageOrder: (sequenceId: string, oldIndex: number, newIndex: number) => void;
  updateChannelConfig: (
    sequenceId: string,
    channelIndex: number,
    newChannelConfig: Partial<StateSequenceChannelConfig>
  ) => void;
  updateSequence: (sequenceId: string, newSequenceSettings: Partial<StateSequence>) => void;
  addSequencePattern: (sequenceId: string, doDuplicateCurrentPattern?: boolean) => void;
  removeCurrentSequencePattern: (sequenceId: string) => void;
  updateSequencePatternOrder: (sequenceId: string, oldIndex: number, newIndex: number) => void;
  performAction: (actionMessage: StateActionMessage) => void;

  // Control shortcuts
  startEditingShortcut: (shortcut: Omit<StateShortcut, 'id' | 'type' | 'key'>) => void;
  stopEditingShortcut: () => void;
  updateShortcut: (id: string, newShortcutSettings: Partial<Omit<StateShortcut, 'id'>>) => void;
  removeShortcut: (id: string) => void;
  addActiveMidiInputDevice: (midiInputDevice: string) => void;
  removeActiveMidiInputDevice: (midiInputDevice: string) => void;
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
export type StateSequencePreset = StateSequenceDrumMachinePreset | StateSequenceSynth;

export interface StateSequenceCommon {
  id: string;
  name: string;
  nSteps: number;
  /** 1-base index as it gets exposed directly through shortcut action message parameters */
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
  /**
   * Amount of mutated steps after each sequence (0/undefined: no steps get mutated, 1: all steps are mutated)
   */
  mutationAmount?: number;
}

export interface StateSequenceDrumMachine extends StateSequenceCommon {
  type: 'drum-machine';
  channelsConfig: StateSequenceChannelConfig[];
}

export interface StateSequenceDrumMachinePreset
  extends Omit<StateSequenceDrumMachine, 'channelsConfig'> {
  channelsConfig: StateSequenceChannelConfigPreset[];
}

export type StateSequenceChannelConfigPreset =
  | Omit<StateSequenceChannelConfigMidiNote, 'id'>
  | Omit<StateSequenceChannelConfigMidiCC, 'id'>
  | Omit<StateSequenceChannelConfigSample, 'id'>;

export interface StateSequenceSynth extends StateSequenceCommon {
  type: 'synth';
  rootNote: number;
  scale: string;
  range: number;
  transpose: number;
  noteDuration: number;
  midiChannel: number;
  isPolyphonic: boolean;
}

export interface StateSequencePattern {
  id: string;
  pages: StateSequencePatternPage[];
}

export interface StateSequencePatternPage {
  id: string;
  steps: StateSequenceStep[];
}

export type StateSequenceChannelConfig =
  | StateSequenceChannelConfigMidiNote
  | StateSequenceChannelConfigMidiCC
  | StateSequenceChannelConfigSample;

export interface StateSequenceChannelConfigCommon {
  id: string;
  name?: string;
  isHidden?: boolean;
  isMuted?: boolean;
  isHighlighted?: boolean;
  /**
   * 0 to 1
   */
  volume?: number;
}

export interface StateSequenceChannelConfigMidiNote extends StateSequenceChannelConfigCommon {
  type: 'midi';
  midiChannel: number;
  midiNote: number;
  /**
   * In some drum machines the volume is controlled by sending a cc message instead of velocity
   */
  volumeCC?: number;
}

export interface StateSequenceChannelConfigMidiCC extends StateSequenceChannelConfigCommon {
  type: 'midi-cc';
  midiChannel: number;
  midiCC: number;
  /**
   * When true, value is always midiCCValue, otherwise it's set by "volume" in StateSequenceChannelConfigCommon
   */
  isFixedValue?: boolean;
  midiCCValue?: number;
}

export interface StateSequenceChannelConfigSample extends StateSequenceChannelConfigCommon {
  type: 'sample';
  audioFile: string;
  /**
   * 1 pitch is sample played at normal rate, <1 is lower pitch, >1 higher pitch
   */
  pitch?: number;
  /**
   * play start 0 to 1 (relative to length of track)
   */
  start?: number;
  /**
   * amount of randomness (positive and negative range) added to the play start. 0 to 1 (relative to length of track)
   */
  startRandomness?: number;
  /**
   * play duration 0 to 1 (relative to length of track)
   */
  duration?: number;
  /**
   * fade in time in seconds
   */
  attack?: number;
  /**
   * fade out time in seconds
   */
  release?: number;
  /**
   * reverb decay time in seconds
   */
  reverbDecay?: number;
  /**
   * 0 is fully dry (no reverb), 1 is fully wet (only reverb)
   */
  reverbWetness?: number;
  /**
   * -1 to 1 (0 is centered)
   */
  pan?: number;
  distortion?: number;
  isReversed?: boolean;
}

export interface StateSequenceStep extends StateSequenceStepProperties {
  channel: number;
  stepIndex: number;
}

export interface StateSequenceStepProperties {
  volume?: number;
  probability?: number;
  duration?: number;
  /**
   * 0 to 1 likelihood of step getting mutated
   */
  mutability?: number;
  /**
   * 1 pitch is sample played at normal rate, <1 is lower pitch, >1 higher pitch
   */
  pitch?: number;
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
  id: string;
  /**
   * Action can have an undefined value, so that it's defined by the midi-note or the midi-cc
   */
  actionMessage: StateActionMessage;
  /**
   * Set to true when we create a new shortcut, so that we see the modal window to assign the shortcut, or when
   * it's being edited after being created.
   */
  isBeingEdited?: boolean;
  /**
   * When not set, it means it's waiting for a keyboard press or midi control, to attach a shortcut to this action
   */
  type?: 'keyboard' | 'midi-note' | 'midi-cc';
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
