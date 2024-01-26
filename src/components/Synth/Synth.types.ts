import { StateSequenceSynth } from "src/state/state.types";
import { SequencerProps } from "../Sequencer/Sequencer";

export interface SynthProps
  extends Omit<
    SequencerProps,
    "triggerCallback" | "channelsConfig" | "sequence"
  > {
  sequence: StateSequenceSynth;
}
