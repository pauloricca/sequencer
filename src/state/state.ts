import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from 'zustand/middleware'
import { Actions, State, StateSequence } from "./state.types";
import { INITIAL_STATE } from "./state.initial";

export const useSequencersState = create<State & Actions>()(
  persist(
    immer((set, get) => ({
      ...INITIAL_STATE,
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
      getSequence: (sequenceName: string) =>
        getSequenceByName(get().sequences, sequenceName),
      reset: () => set(() => INITIAL_STATE)
    })),
    {
        name: 'sequencers', // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      },
  )
);

const getSequenceByName = (sequences: StateSequence[], sequenceName: string) =>
  sequences.find(({ name }) => name === sequenceName);
