import { nanoid } from 'nanoid';
import { INITIAL_STATE } from './state.initial';
import {
  State,
  StateSequenceDrumMachine,
  StateSequencePattern,
  StateSequencePatternPage,
  StateSequenceSynth,
} from './state.types';
import { cloneDeep } from 'lodash';

export const getIntervalFromClockSpeed = (clockSpeed: number) => 60000 / clockSpeed;

// TODO: migrate version (0 or undefined) to 1: set version to 1, add controlShortcuts opject. bring in "shortcuts" if exists and delete it.
export const migrate = (state: State, version: number) => {
  const newState = { ...INITIAL_STATE, ...state };

  console.log('before migration', cloneDeep(newState));

  newState.sequences.forEach((sequence) => {
    addNonExistentProperties(sequence, getDefaultSequence(sequence.type));
    sequence.patterns.forEach((pattern) => {
      addNonExistentProperties(pattern, getDefaultPattern());
      pattern.pages.forEach((page) => {
        addNonExistentProperties(page, getDefaultPatternPage());
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

  console.log('after migration', cloneDeep(newState));

  return newState;
};

// Copies properties from source to destination, if they don't exist in destination
export const addNonExistentProperties = (destination: any, source: any) => {
  Object.keys(source).forEach((key) => {
    if (!Object.keys(destination).includes(key)) {
      destination[key] = source[key];
    }
  });
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
