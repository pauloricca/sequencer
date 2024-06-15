import { State } from './state.types';

export const INITIAL_STATE: State = {
  version: 5,
  isPlaying: false,
  clockSpeed: 130 * 4,
  swing: 0.5,
  sequences: [],
  controlShortcuts: {
    shortcuts: [],
    activeMidiInputDevices: [],
  },
};
