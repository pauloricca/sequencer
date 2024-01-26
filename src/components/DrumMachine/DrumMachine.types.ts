import { StateSequenceDrumMachine } from "src/state/state.types";
import { SequencerProps } from "../Sequencer/Sequencer";

export interface DrumMachineProps
  extends Omit<SequencerProps, "triggerCallback" | "channelsConfig" | "sequence"> {
    sequence: StateSequenceDrumMachine;
  }
