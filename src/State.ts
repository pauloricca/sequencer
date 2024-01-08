import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface StateSequence {
  name: string;
  nSteps: number;
  nChannels: number;
  steps: StateSequenceStep[];
}

export interface StateSequenceStep {
  channel: number;
  stepIndex: number;
}

type State = {
  sequences: StateSequence[];
};

type Actions = {
  setStep: (sequenceName: string) => (step: StateSequenceStep) => void;
  removeStep: (sequenceName: string) => (stepIndex: StateSequenceStep) => void;
  getSequence: (sequenceName: string) => StateSequence | undefined;
};

export const useSequencersState = create<State & Actions>()(
  immer((set, get) => ({
    sequences: [{ name: "beats", nSteps: 16, nChannels: 10, steps: [] }],
    setStep: (sequenceName) => (step) =>
      set((state) => {
        const sequence = getSequenceByName(state.sequences, sequenceName);
        if (sequence) {
          sequence.steps = [
            ...sequence.steps.filter(
              ({ channel, stepIndex }) =>
                channel !== step.channel || stepIndex !== step.stepIndex
            ),
            step,
          ];
        }
      }),
    removeStep: (sequenceName) => (step) =>
      set((state) => {
        const sequence = getSequenceByName(state.sequences, sequenceName);
        if (sequence) {
          sequence.steps = sequence.steps.filter(
            ({ channel, stepIndex }) =>
              channel != step.channel || step.stepIndex != stepIndex
          );
        }
      }),
    getSequence: (sequenceName: string) => getSequenceByName(get().sequences, sequenceName),
  }))
);

const getSequenceByName = (sequences: StateSequence[], sequenceName: string) =>
  sequences.find(({ name }) => name === sequenceName);