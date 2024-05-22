import { nanoid } from 'nanoid';
import { INITIAL_STATE } from './state.initial';
import {
  State,
  StateSequenceDrumMachine,
  StateSequencePattern,
  StateSequencePatternPage,
  StateSequenceSynth,
} from './state.types';
import { merge } from 'lodash';

export const getIntervalFromClockSpeed = (clockSpeed: number) => 60000 / clockSpeed;

// TODO: migrate version (0 or undefined) to 1: set version to 1, add controlShortcuts opject. bring in "shortcuts" if exists and delete it.
export const migrate = (state: State, version: number) => {
  const newState = { ...INITIAL_STATE, ...state };

  newState.sequences.forEach((sequence) => {
    merge(sequence, getDefaultSequence(sequence.type));
    sequence.patterns.forEach((pattern) => {
      merge(pattern, getDefaultPattern());
      pattern.pages.forEach((page) => {
        merge(page, getDefaultPatternPage());
      });
    });
  });

  if (state.version === undefined) {
    state.version = 0;
  }

  if (state.version < 2) {
    //we just need to add ids to sequences, which is covered by the merge to default above
  }

  newState.version = INITIAL_STATE.version;

  return newState;
};

export const getDefaultSequence = (type: 'synth' | 'drum-machine') =>
  type === 'synth' ? getDefaultSynth() : getDefaultDrumMachine();

export const getDefaultSynth = (): StateSequenceSynth => ({
  type: 'synth',
  id: nanoid(),
  name: 'synth',
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
  isPolyphonic: true,
});

export const getDefaultDrumMachine = (): StateSequenceDrumMachine => ({
  type: 'drum-machine',
  id: nanoid(),
  name: 'drums',
  nSteps: 16,
  stepLength: 1,
  currentPattern: 0,
  patterns: [getDefaultPattern()],
  channelsConfig: [],
});

export const getDefaultPattern = (): StateSequencePattern => ({
  id: nanoid(),
  pages: [getDefaultPatternPage()],
});

export const getDefaultPatternPage = (): StateSequencePatternPage => ({
  id: nanoid(),
  steps: [],
});
