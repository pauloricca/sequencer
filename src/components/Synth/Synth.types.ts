import { StateSequenceChannelConfig, StateSequenceSynth } from "src/state/state.types";
import { SequencerProps } from "../Sequencer/Sequencer";

export interface SynthProps
  extends Omit<SequencerProps, "triggerCallback" | "channelsConfig" | "sequence"> {
    sequence: StateSequenceSynth;
  }

export type SynthChannelConfig = StateSequenceChannelConfig &
  (SynthChannelConfigMidi | SynthChannelConfigSample);

export type SynthChannelConfigMidi = {
  type: 'midi';
  note: number;
};

export type SynthChannelConfigSample = {
  type: 'sample';
  soundFile: string;
};
