import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  StateActions,
  State,
  StateSequence,
  StateSequenceDrumMachine,
  StateSequenceSynth,
  StateAction,
} from "./state.types";
import { INITIAL_STATE } from "./state.initial";
import { unregisterMidiOutputDevice } from "../utils/midi";
import { getBlankPattern } from "./state.utils";

const setStep: StateAction =
  (set): StateActions["setStep"] =>
  (sequenceName) =>
  (step, pageNumber) =>
    set((state) => {
      const sequence = getSequenceByName(state.sequences, sequenceName);
      if (
        sequence &&
        sequence.patterns[sequence.currentPattern] &&
        sequence.patterns[sequence.currentPattern].pages.length > pageNumber
      ) {
        sequence.patterns[sequence.currentPattern].pages[pageNumber].steps = [
          ...sequence.patterns[sequence.currentPattern].pages[
            pageNumber
          ].steps.filter(
            ({ channel, stepIndex }) =>
              (channel !== step.channel &&
                (sequence as StateSequenceSynth).isPolyphonic !== false) ||
              stepIndex !== step.stepIndex
          ),
          step,
        ];
      }
    });

const removeStep: StateAction =
  (set): StateActions["removeStep"] =>
  (sequenceName) =>
  (step, pageNumber) =>
    set((state) => {
      const sequence = getSequenceByName(state.sequences, sequenceName);
      if (
        sequence &&
        sequence.patterns[sequence.currentPattern] &&
        sequence.patterns[sequence.currentPattern].pages.length > pageNumber
      ) {
        sequence.patterns[sequence.currentPattern].pages[pageNumber].steps =
          sequence.patterns[sequence.currentPattern].pages[
            pageNumber
          ].steps.filter(
            ({ channel, stepIndex }) =>
              channel != step.channel || step.stepIndex != stepIndex
          );
      }
    });

const addPage: StateAction =
  (set): StateActions["addPage"] =>
  (sequenceName) =>
  (page) =>
    set((state) => {
      const sequence = getSequenceByName(state.sequences, sequenceName);
      if (
        sequence &&
        sequence.patterns[sequence.currentPattern]
      ) {
        sequence.patterns[sequence.currentPattern].pages.push(page ?? getBlankPattern().pages[0]);
      }
    });

const removePage: StateAction =
  (set): StateActions["removePage"] =>
  (sequenceName) =>
  (pageNumber) =>
    set((state) => {
      const sequence = getSequenceByName(state.sequences, sequenceName);
      if (
        sequence &&
        sequence.patterns[sequence.currentPattern]
      ) {
        sequence.patterns[sequence.currentPattern].pages.splice(pageNumber, 1);
      }
    });

const updateStep: StateAction =
  (set): StateActions["updateStep"] =>
  (sequenceName) =>
  (step, pageNumber) =>
  (newSequenceSettings) =>
    set((state) => {
      const sequence = getSequenceByName(state.sequences, sequenceName);
      if (
        sequence &&
        sequence.patterns[sequence.currentPattern] &&
        sequence.patterns[sequence.currentPattern].pages.length > pageNumber
      ) {
        const stepToMutate = sequence.patterns[sequence.currentPattern].pages[
          pageNumber
        ].steps.find(
          ({ channel, stepIndex }) =>
            channel == step.channel && step.stepIndex == stepIndex
        );
        if (stepToMutate) {
          Object.keys(newSequenceSettings).forEach(
            (key) =>
              ((stepToMutate as any)[key] = (newSequenceSettings as any)[key])
          );
        }
      }
    });

const updateChannelConfig: StateAction =
  (set): StateActions["updateChannelConfig"] =>
  (sequenceName) =>
  (channelIndex) =>
  (newChannelConfig) =>
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
    });

const updateSequence: StateAction =
  (set): StateActions["updateSequence"] =>
  (sequenceName) =>
  (newSequenceSettings) =>
    set((state) => {
      const sequence = getSequenceByName(state.sequences, sequenceName);
      if (sequence) {
        // Check if we need to unregister midi devices
        if (
          newSequenceSettings.midiOutDeviceName &&
          sequence.midiOutDeviceName &&
          newSequenceSettings.midiOutDeviceName !== sequence.midiOutDeviceName
        ) {
          // No other sequence using the midi device that was being used on this sequence?
          if (
            !state.sequences.filter(
              (otherSequence) =>
                otherSequence !== sequence &&
                otherSequence.midiOutDeviceName === sequence.midiOutDeviceName
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
            pattern.pages.forEach((page) =>
              page.steps.forEach((step) => {
                if ((sequence as StateSequenceSynth).range % 2 === 0) {
                  step.channel += Math.floor(rangeDifference / 2);
                } else {
                  step.channel += Math.ceil(rangeDifference / 2);
                }
              })
            )
          );
        }

        Object.keys(newSequenceSettings).forEach(
          (key) => ((sequence as any)[key] = (newSequenceSettings as any)[key])
        );
      }
    });

const setClockSpeed: StateAction =
  (set): StateActions["setClockSpeed"] =>
  (clockSpeed) =>
    set((state) => {
      state.clockSpeed = clockSpeed;
    });

const reset: StateAction =
  (set): StateActions["reset"] =>
  (state = INITIAL_STATE) =>
    set(() => state);

export const useSequencersState = create<State & StateActions>()(
  persist(
    immer((set, get) => ({
      ...INITIAL_STATE,
      setStep: setStep(set, get),
      removeStep: removeStep(set, get),
      updateStep: updateStep(set, get),
      addPage: addPage(set, get),
      removePage: removePage(set, get),
      updateChannelConfig: updateChannelConfig(set, get),
      updateSequence: updateSequence(set, get),
      setClockSpeed: setClockSpeed(set, get),
      reset: reset(set, get),
    })),
    {
      name: "sequencers", // name of the item in the storage (must be unique)
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

const getSequenceByName = (sequences: StateSequence[], sequenceName: string) =>
  sequences.find(({ name }) => name === sequenceName);
