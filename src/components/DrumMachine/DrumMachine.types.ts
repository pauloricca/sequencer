import { StateSequenceDrumMachine } from 'state/state.types';
import { SequencerProps } from 'components/Sequencer/Sequencer';

export interface DrumMachineProps
  extends Omit<SequencerProps, 'triggerCallback' | 'channelsConfig' | 'sequence'> {
  sequence: StateSequenceDrumMachine
}
