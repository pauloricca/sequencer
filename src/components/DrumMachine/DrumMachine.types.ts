import { StateSequenceChannelConfig, StateSequenceDrumMachine } from "src/state/state.types";
import { SequencerProps } from "../Sequencer/Sequencer";

export interface DrumMachineProps
  extends Omit<SequencerProps, "triggerCallback" | "channelsConfig" | "sequence"> {
    sequence: StateSequenceDrumMachine;
  }

export type DrumMachineChannelConfig = StateSequenceChannelConfig &
  (DrumMachineChannelConfigMidi | DrumMachineChannelConfigSample);

export type DrumMachineChannelConfigMidi = {
  type: 'midi';
  channel: number;
  note: number;
};

export type DrumMachineChannelConfigSample = {
  type: 'sample';
  soundFile: string;
};
