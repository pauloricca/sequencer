import { StateSequence, StateSequenceSynth } from 'state/state.types';
import { getDefaultSequence } from 'state/state.utils';
import { PRESET_VOLCA_DRUMS } from './presets.volca-drums';
import { PRESET_VOLCA_BEATS } from './presets.volca-beats';
import { PRESET_909_SAMPLES } from './presets.909-samples';
import { PRESET_MIDI_CC_TRIGGER } from './presets.midi-cc-trigger';

export const PRESETS: StateSequence[] = [
  PRESET_VOLCA_DRUMS,
  PRESET_VOLCA_BEATS,
  PRESET_909_SAMPLES,
  PRESET_MIDI_CC_TRIGGER,
  {
    ...getDefaultSequence('synth'),
    name: 'synth',
  } as StateSequenceSynth,
];
