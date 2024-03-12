import { StateSequenceSynth } from 'state/state.types';
import { SequencerProps } from 'components/Sequencer/Sequencer';

export interface SynthProps
  extends Omit<SequencerProps, 'triggerCallback' | 'channelsConfig' | 'sequence'> {
  sequence: StateSequenceSynth;
}
