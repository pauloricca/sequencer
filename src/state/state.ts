import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  Actions,
  State,
  StateSequence,
  StateSequenceDrumMachine,
  StateSequenceSynth,
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
      updateChannelConfig: (sequenceName) => (channelIndex) => (newChannelConfig) =>
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
              newSequenceSettings.midiOutDeviceName &&
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

            // Check if we need to shift the steps because of a range change
            if (
              (newSequenceSettings as StateSequenceSynth).range &&
              (newSequenceSettings as StateSequenceSynth).range !==
                (sequence as StateSequenceSynth).range
            ) {
              const rangeDifference =
                (newSequenceSettings as StateSequenceSynth).range -
                (sequence as StateSequenceSynth).range;

              sequence.patterns.forEach((pattern) =>
                pattern.steps.forEach((step) => {
                  if ((sequence as StateSequenceSynth).range % 2 === 0) {
                    step.channel += Math.floor(
                      (rangeDifference / 2)
                    );
                  } else {
                    step.channel += Math.ceil(
                      (rangeDifference / 2)
                    );
                  }
                })
              );
            }

            Object.keys(newSequenceSettings).forEach(
              (key) =>
                ((sequence as any)[key] = (newSequenceSettings as any)[key])
            );
          }
        }),
      setClockSpeed: (clockSpeed) =>
        set((state) => { state.clockSpeed = clockSpeed }),
      getSequence: (sequenceName) =>
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
