import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  Actions,
  State,
  StateSequence,
  StateSequenceDrumMachine,
} from "./state.types";
import { INITIAL_STATE } from "./state.initial";
import { unregisterMidiOutputDevice } from "../utils/midi";

export const useSequencersState = create<State & Actions>()(
  persist(
    immer((set, get) => ({
      ...INITIAL_STATE,
      setStep: (sequenceName) => (step) =>
        set((state) => {
          const sequence = getSequenceByName(state.sequences, sequenceName);
          if (sequence && sequence.patterns[sequence.currentPattern]) {
            sequence.patterns[sequence.currentPattern].steps = [
              ...sequence.patterns[sequence.currentPattern].steps.filter(
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
          if (sequence && sequence.patterns[sequence.currentPattern]) {
            sequence.patterns[sequence.currentPattern].steps =
              sequence.patterns[sequence.currentPattern].steps.filter(
                ({ channel, stepIndex }) =>
                  channel != step.channel || step.stepIndex != stepIndex
              );
          }
        }),
      updateChannelConfig: (sequenceName, channelIndex) => (newChannelConfig) =>
        set((state) => {
          const channelConfig = (
            getSequenceByName(
              state.sequences,
              sequenceName
            ) as StateSequenceDrumMachine
          )?.channelsConfig[channelIndex];
          if (channelConfig) {
            Object.keys(newChannelConfig).forEach(
              (key) =>
                ((channelConfig as any)[key] = (newChannelConfig as any)[key])
            );
          }
        }),
      updateSequence: (sequenceName) => (newSequenceSettings) =>
        set((state) => {
          const sequence = getSequenceByName(state.sequences, sequenceName);
          if (sequence) {
            // Check if we need to unregister midi devices
            if (
              sequence.midiOutDeviceName &&
              newSequenceSettings.midiOutDeviceName !==
                sequence.midiOutDeviceName
            ) {
              // No other sequence using the midi device that was being used on this sequence?
              if (
                !state.sequences.filter(
                  (otherSequence) =>
                    otherSequence !== sequence &&
                    otherSequence.midiOutDeviceName ===
                      sequence.midiOutDeviceName
                ).length
              ) {
                unregisterMidiOutputDevice(sequence.midiOutDeviceName);
              }
            }
            Object.keys(newSequenceSettings).forEach(
              (key) =>
                ((sequence as any)[key] = (newSequenceSettings as any)[key])
            );
          }
        }),
      getSequence: (sequenceName: string) =>
        getSequenceByName(get().sequences, sequenceName),
      reset: (state = INITIAL_STATE) => set(() => state),
    })),
    {
      name: "sequencers", // name of the item in the storage (must be unique)
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

const getSequenceByName = (sequences: StateSequence[], sequenceName: string) =>
  sequences.find(({ name }) => name === sequenceName);
