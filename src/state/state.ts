import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import {
  StateActions,
  State,
  StateSequence,
  StateSequenceDrumMachine,
  StateSequenceSynth,
  StateAction,
  StateSequenceChannelConfig,
} from './state.types';
import { INITIAL_STATE } from './state.initial';
import { getBlankPattern, migrate } from './state.utils';
import { Draft } from 'immer';
import { cloneDeep } from 'lodash';
import { nanoid } from 'nanoid';
import { arrayMove } from '@dnd-kit/sortable';

const updateSequenceOrder: StateAction =
  (set): StateActions['updateSequenceOrder'] =>
  (oldIndex, newIndex) =>
    set((state) => {
      state.sequences = arrayMove(state.sequences, oldIndex, newIndex);
    });

const setIsPlaying: StateAction =
  (set): StateActions['setIsPlaying'] =>
  (isPlaying) =>
    set((state) => {
      state.isPlaying = isPlaying;
    });

const setClockSpeed: StateAction =
  (set): StateActions['setClockSpeed'] =>
  (clockSpeed) =>
    set((state) => {
      state.clockSpeed = clockSpeed;
    });

const setSwing: StateAction =
  (set): StateActions['setSwing'] =>
  (swing) =>
    set((state) => {
      state.swing = swing;
    });

const setStep: StateAction =
  (set): StateActions['setStep'] =>
  (sequenceId, step, pageNumber) =>
    set((state) => {
      const sequence = getSequenceById(state.sequences, sequenceId);

      if (
        sequence?.patterns[sequence.currentPattern] &&
        sequence.patterns[sequence.currentPattern].pages.length > pageNumber
      ) {
        sequence.patterns[sequence.currentPattern].pages[pageNumber].steps = [
          ...sequence.patterns[sequence.currentPattern].pages[pageNumber].steps.filter(
            ({ channel, stepIndex }) =>
              (channel !== step.channel &&
                (sequence as StateSequenceSynth).isPolyphonic !== false) ||
              stepIndex !== step.stepIndex
          ),
          {
            ...step,
            duration:
              sequence.type === 'synth' ? (sequence as StateSequenceSynth).noteDuration : undefined,
          },
        ];
      }
    });

const removeStep: StateAction =
  (set): StateActions['removeStep'] =>
  (sequenceId, step, pageNumber) =>
    set((state) => {
      const sequence = getSequenceById(state.sequences, sequenceId);

      if (
        sequence?.patterns[sequence.currentPattern] &&
        sequence.patterns[sequence.currentPattern].pages.length > pageNumber
      ) {
        sequence.patterns[sequence.currentPattern].pages[pageNumber].steps = sequence.patterns[
          sequence.currentPattern
        ].pages[pageNumber].steps.filter(
          ({ channel, stepIndex }) => channel !== step.channel || step.stepIndex !== stepIndex
        );
      }
    });

const addPage: StateAction =
  (set): StateActions['addPage'] =>
  (sequenceId, page, duplicatePageByIndex) =>
    set((state) => {
      const sequence = getSequenceById(state.sequences, sequenceId);

      if (sequence?.patterns[sequence.currentPattern]) {
        sequence.patterns[sequence.currentPattern].pages.push(
          page ??
            (duplicatePageByIndex !== undefined
              ? sequence.patterns[sequence.currentPattern].pages[duplicatePageByIndex]
              : getBlankPattern().pages[0])
        );
      }
    });

const removePage: StateAction =
  (set): StateActions['removePage'] =>
  (sequenceId, pageNumber) =>
    set((state) => {
      const sequence = getSequenceById(state.sequences, sequenceId);

      if (sequence?.patterns[sequence.currentPattern]) {
        sequence.patterns[sequence.currentPattern].pages.splice(pageNumber, 1);
      }
    });

const updateStep: StateAction =
  (set): StateActions['updateStep'] =>
  (sequenceId, step, pageNumber, newSequenceSettings) =>
    set((state) => {
      const sequence = getSequenceById(state.sequences, sequenceId);

      if (
        sequence?.patterns[sequence.currentPattern] &&
        sequence.patterns[sequence.currentPattern].pages.length > pageNumber
      ) {
        const stepToMutate = sequence.patterns[sequence.currentPattern].pages[
          pageNumber
        ].steps.find(
          ({ channel, stepIndex }) => channel === step.channel && step.stepIndex === stepIndex
        );

        if (stepToMutate) {
          Object.keys(newSequenceSettings).forEach(
            (key) => ((stepToMutate as any)[key] = (newSequenceSettings as any)[key])
          );
        }
      }
    });

const updateChannelConfigAction = (
  state: Draft<State & StateActions>,
  sequenceId: string,
  channelIndex: number,
  newChannelConfig: Partial<StateSequenceChannelConfig>
) => {
  const channelConfig = (getSequenceById(state.sequences, sequenceId) as StateSequenceDrumMachine)
    ?.channelsConfig[channelIndex];

  if (channelConfig) {
    Object.keys(newChannelConfig).forEach(
      (key) => ((channelConfig as any)[key] = (newChannelConfig as any)[key])
    );
  }
};

const updateChannelConfig: StateAction =
  (set): StateActions['updateChannelConfig'] =>
  (sequenceId, channelIndex, newChannelConfig) =>
    set((state) => updateChannelConfigAction(state, sequenceId, channelIndex, newChannelConfig));

const updateSequenceAction = (
  state: Draft<State & StateActions>,
  sequenceId: string,
  newSequenceSettings: Partial<StateSequence>
) => {
  const sequence = getSequenceById(state.sequences, sequenceId);

  if (sequence) {
    // Check if we need to shift the steps because of a range change
    if (
      (newSequenceSettings as StateSequenceSynth).range &&
      (newSequenceSettings as StateSequenceSynth).range !== (sequence as StateSequenceSynth).range
    ) {
      const rangeDifference =
        (newSequenceSettings as StateSequenceSynth).range - (sequence as StateSequenceSynth).range;

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

    // Check if we need to update shortcuts when we change the sequence name
    if (newSequenceSettings.name !== undefined) {
      state.controlShortcuts.shortcuts.forEach(({ actionMessage }) => {
        if (actionMessage.sequenceName === sequence.name) {
          actionMessage.sequenceName = newSequenceSettings.name || '';
        }
      });
    }

    Object.keys(newSequenceSettings).forEach(
      (key) => ((sequence as any)[key] = (newSequenceSettings as any)[key])
    );
  }
};

const updateSequence: StateAction =
  (set): StateActions['updateSequence'] =>
  (sequenceId, newSequenceSettings) =>
    set((state) => updateSequenceAction(state, sequenceId, newSequenceSettings));

const addSequencePattern: StateAction =
  (set): StateActions['addSequencePattern'] =>
  (sequenceId, doDuplicateCurrentPattern) =>
    set((state) => {
      const sequence = getSequenceById(state.sequences, sequenceId);

      if (!sequence) return;

      updateSequenceAction(state, sequenceId, {
        patterns: [
          ...sequence.patterns,
          doDuplicateCurrentPattern
            ? cloneDeep(sequence.patterns[sequence.currentPattern])
            : getBlankPattern(),
        ],
        currentPattern: sequence.patterns.length,
      });
    });

const removeCurrentSequencePattern: StateAction =
  (set): StateActions['removeCurrentSequencePattern'] =>
  (sequenceId) =>
    set((state) => {
      const sequence = getSequenceById(state.sequences, sequenceId);

      if (!sequence) return;

      updateSequenceAction(state, sequence.name, {
        patterns:
          sequence.patterns.length > 1
            ? sequence.patterns.filter((_, index) => index !== sequence.currentPattern)
            : [getBlankPattern()],
        currentPattern: Math.max(0, sequence.currentPattern - 1),
      });
    });

const performAction: StateAction =
  (set): StateActions['performAction'] =>
  (actionMessage) =>
    set((state) => {
      switch (actionMessage.type) {
        case 'Sequence Param Change':
          updateSequenceAction(
            state,
            getSequenceByName(state.sequences, actionMessage.sequenceName)?.id || '',
            {
              [actionMessage.parameter]: actionMessage.value,
            }
          );
          break;
        case 'Channel Param Change':
          updateChannelConfigAction(
            state,
            getSequenceByName(state.sequences, actionMessage.sequenceName)?.id || '',
            actionMessage.channelIndex,
            {
              [actionMessage.parameter]: actionMessage.value,
            }
          );
          break;
      }
    });

const startListeningToNewShortcut: StateAction =
  (set): StateActions['startEditingShortcut'] =>
  (shortcut) =>
    set((state) => {
      state.controlShortcuts.shortcuts.push({
        ...shortcut,
        isBeingEdited: true,
        id: nanoid(),
      });
    });

const updateShortcut: StateAction =
  (set): StateActions['updateShortcut'] =>
  (id, newShortcutSettings) =>
    set((state) => {
      const shortcutToUpdate = state.controlShortcuts.shortcuts.find(
        (shortcut) => shortcut.id === id
      );

      if (shortcutToUpdate) {
        Object.keys(newShortcutSettings).forEach(
          (key) => ((shortcutToUpdate as any)[key] = (newShortcutSettings as any)[key])
        );
      }
    });

const stopEditingShortcut: StateAction =
  (set): StateActions['stopEditingShortcut'] =>
  () =>
    set((state) => {
      state.controlShortcuts.shortcuts = state.controlShortcuts.shortcuts.filter(
        ({ type }) => !!type
      );
      const shortcutBeingEdited = state.controlShortcuts.shortcuts.find(
        ({ isBeingEdited }) => isBeingEdited
      );

      if (shortcutBeingEdited) shortcutBeingEdited.isBeingEdited = false;
    });

const removeShortcut: StateAction =
  (set): StateActions['removeShortcut'] =>
  (id) =>
    set((state) => {
      state.controlShortcuts.shortcuts = state.controlShortcuts.shortcuts.filter(
        (existingShortcut) => existingShortcut.id !== id
      );
    });

const addActiveMidiInputDevice: StateAction =
  (set): StateActions['addActiveMidiInputDevice'] =>
  (midiInputDevice) =>
    set((state) => {
      !state.controlShortcuts.activeMidiInputDevices.includes(midiInputDevice) &&
        state.controlShortcuts.activeMidiInputDevices.push(midiInputDevice);
    });

const removeActiveMidiInputDevice: StateAction =
  (set): StateActions['addActiveMidiInputDevice'] =>
  (midiInputDevice) =>
    set((state) => {
      if (state.controlShortcuts.activeMidiInputDevices.includes(midiInputDevice)) {
        state.controlShortcuts.activeMidiInputDevices =
          state.controlShortcuts.activeMidiInputDevices.filter(
            (device) => device !== midiInputDevice
          );
      }
    });

const reset: StateAction =
  (set): StateActions['reset'] =>
  (state = INITIAL_STATE) =>
    set(() => migrate(state, state.version));

export const useSequencersState = create<State & StateActions>()(
  persist(
    immer((set, get) => ({
      ...INITIAL_STATE,
      updateSequenceOrder: updateSequenceOrder(set, get),
      setIsPlaying: setIsPlaying(set, get),
      setClockSpeed: setClockSpeed(set, get),
      setSwing: setSwing(set, get),
      setStep: setStep(set, get),
      removeStep: removeStep(set, get),
      updateStep: updateStep(set, get),
      addPage: addPage(set, get),
      removePage: removePage(set, get),
      updateChannelConfig: updateChannelConfig(set, get),
      updateSequence: updateSequence(set, get),
      addSequencePattern: addSequencePattern(set, get),
      removeCurrentSequencePattern: removeCurrentSequencePattern(set, get),
      performAction: performAction(set, get),
      startEditingShortcut: startListeningToNewShortcut(set, get),
      stopEditingShortcut: stopEditingShortcut(set, get),
      updateShortcut: updateShortcut(set, get),
      removeShortcut: removeShortcut(set, get),
      addActiveMidiInputDevice: addActiveMidiInputDevice(set, get),
      removeActiveMidiInputDevice: removeActiveMidiInputDevice(set, get),
      reset: reset(set, get),
    })),
    {
      name: 'sequencers', // name of the item in the storage (must be unique)
      version: INITIAL_STATE.version,
      migrate: migrate as () => State & StateActions,
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

const getSequenceById = (sequences: StateSequence[], sequenceId: string) =>
  sequences.find(({ id }) => id === sequenceId);

const getSequenceByName = (sequences: StateSequence[], sequenceName: string) =>
  sequences.find(({ name }) => name === sequenceName);
