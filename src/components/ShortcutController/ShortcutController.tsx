import { Icon } from '@blueprintjs/core';
import { Modal } from 'components/Modal/Modal';
import { SelectKnob } from 'components/SelectKnob/SelectKnob';
import React, { useCallback, useEffect, useRef } from 'react';
import { useSequencersState } from 'state/state';
import { StateShortcut } from 'state/state.types';
import {
  MidiEventHandler,
  addMidiEventListener,
  removeMidiEventListener,
  useMidiDeviceNames,
} from 'utils/midi';
import {
  MIDI_ACTIONS_THROTTLE_TIME,
  SHORTCUT_EDIT_MODAL_DEPTH,
  SHORTCUT_TYPE_OPTIONS,
} from './ShortcutController.constants';
import { getStepFromDecimalPlaces, hasInputInFocus } from './ShortcutController.utils';
import { SelectKnobMidi } from 'components/SelectKnob/SelectKnobMidi/SelectKnobMidi';
import { MIDI_MAX_CC, MIDI_MAX_CHANNELS, MIDI_MAX_NOTE } from 'components/components.constants';
import { throttle } from 'lodash';
require('./_ShortcutController.scss');

export const ShortcutController: React.FC = () => {
  const shortcuts = useSequencersState((state) => state.controlShortcuts.shortcuts);
  // Save updated ref so we can use inside listeners
  const shortcutsRef = useRef(shortcuts);
  const updateShortcut = useSequencersState((state) => state.updateShortcut);
  const stopEditingShortcut = useSequencersState((state) => state.stopEditingShortcut);
  const performAction = useSequencersState((state) => state.performAction);
  const removeShortcut = useSequencersState((state) => state.removeShortcut);
  const activeMidiInputDevices = useSequencersState(
    (state) => state.controlShortcuts.activeMidiInputDevices
  );
  const addActiveMidiInputDevice = useSequencersState((state) => state.addActiveMidiInputDevice);
  const removeActiveMidiInputDevice = useSequencersState(
    (state) => state.removeActiveMidiInputDevice
  );
  const midiDeviceNames = useMidiDeviceNames('input');
  const shortcutBeingEdited = shortcuts.find(({ isBeingEdited }) => isBeingEdited);
  /**
   * If we perform all actions from midi callbacks very quickly we affect performance,
   * but we don't want to throttle them all together as several sliders might be moved at the
   * same time, for example, and we want the first and last of each of them to be handled,
   * so we keep throttled callbacks for each of the shortcuts (mapped by their ids).
   */
  const throttledMidiActions = useRef<{ [shortcutId: string]: any }>({});

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keypress', keyPressedHandler);
    addMidiEventListener(midiEventHandler);

    return () => {
      document.removeEventListener('keypress', keyPressedHandler);
      removeMidiEventListener(midiEventHandler);
    };
  }, []);

  const midiEventHandler: MidiEventHandler = useCallback((event) => {
    if (event.type !== 'note-on' && event.type !== 'cc') {
      return;
    }

    const shortcutBeingEdited = shortcutsRef.current.find(({ isBeingEdited }) => isBeingEdited);

    if (!shortcutBeingEdited) {
      // CC
      shortcutsRef.current
        .filter(
          ({ type, midiDevice, midiChannel, midiControl }) =>
            type === 'midi-cc' &&
            midiDevice === event.deviceName &&
            midiChannel === event.channel &&
            midiControl === event.control
        )
        .forEach(({ actionMessage, valueRangeMin: min, valueRangeMax: max, decimalPlaces }) => {
          let value = actionMessage.value;

          // Don't do anything if this is meant to be controlled by a pad (action should come with a value)
          if (value !== undefined && event.value === 0) return;

          if (value === undefined)
            value = Number(
              ((min ?? 0) + ((max ?? 1) - (min ?? 0)) * ((event.value ?? 127) / 127)).toFixed(
                decimalPlaces ?? 1
              )
            );

          performAction({
            ...actionMessage,
            value,
          });
        });

      // Note
      shortcutsRef.current
        .filter(
          ({ type, midiDevice, midiChannel }) =>
            type === 'midi-note' && midiDevice === event.deviceName && midiChannel === event.channel
        )
        .forEach(({ id, actionMessage }) => {
          if (!throttledMidiActions.current[id]) {
            throttledMidiActions.current[id] = throttle(
              (callback: () => void) => callback(),
              MIDI_ACTIONS_THROTTLE_TIME
            );
          }
          throttledMidiActions.current[id](() =>
            performAction({
              ...actionMessage,
              value: event.note,
            })
          );
        });
    } else {
      // Workaround for accessing state within callback
      const activeMidiInputDevices =
        useSequencersState.getState().controlShortcuts.activeMidiInputDevices;

      if (activeMidiInputDevices.includes(event.deviceName)) {
        updateShortcut(shortcutBeingEdited.id, {
          type: event.type === 'note-on' ? 'midi-note' : 'midi-cc',
          midiDevice: event.deviceName,
          midiNote: event.note,
          midiControl: event.control,
          midiChannel: event.channel,
          isBeingEdited: false,
        });
      }
    }
  }, []);

  const keyPressedHandler = useCallback((e: KeyboardEvent) => {
    if (hasInputInFocus()) return;

    const pressedKey = e.key;
    const pressedKeyCode = e.charCode ?? e.keyCode ?? e.which ?? 0;

    const shortcutCurrentlyBeingEdited = shortcutsRef.current.find(
      ({ isBeingEdited }) => isBeingEdited
    );

    if (!shortcutCurrentlyBeingEdited) {
      shortcutsRef.current
        .filter(({ type, key }) => type === 'keyboard' && key === pressedKey)
        .forEach(({ actionMessage }) => performAction(actionMessage));
    } else {
      updateShortcut(shortcutCurrentlyBeingEdited?.id, {
        actionMessage: {
          ...shortcutCurrentlyBeingEdited.actionMessage,
          value: shortcutCurrentlyBeingEdited.actionMessage.value ?? pressedKeyCode,
        },
        type: 'keyboard',
        key: pressedKey,
        isBeingEdited: false,
      });
    }
  }, []);

  const getActionDecription = (shortcut: StateShortcut) =>
    Object.values(shortcut.actionMessage).join(' – ');

  const getTriggerDecription = (shortcut: StateShortcut) =>
    [
      shortcut.key ? `key: ${shortcut.key}` : '',
      shortcut.midiDevice,
      shortcut.midiChannel ? `ch:${shortcut.midiChannel}` : '',
      shortcut.midiControl ? `cc:${shortcut.midiControl}` : '',
      shortcut.midiNote ? `note:${shortcut.midiNote}` : '',
    ]
      .filter(Boolean)
      .join(', ');

  return (
    <div className="shortcut-controller">
      <div className="shortcut-controller__section">
        <p className="shortcut-controller__section-header">shortcuts</p>
        {shortcuts.map((shortcut) => (
          <p className="shortcut-controller__item" key={shortcut.id}>
            <Icon
              icon="trash"
              className="shortcut-controller__remove-shortcut-button"
              onClick={() => removeShortcut(shortcut.id)}
            />
            <button
              className="link-button"
              onClick={() => updateShortcut(shortcut.id, { isBeingEdited: true })}
            >
              {getTriggerDecription(shortcut)} – {getActionDecription(shortcut)}
            </button>
          </p>
        ))}
      </div>
      <div className="shortcut-controller__section">
        <p className="shortcut-controller__section-header">
          midi devices used to trigger new shortcuts
        </p>
        {midiDeviceNames.map((midiDevice) => (
          <label className="shortcut-controller__item" key={midiDevice}>
            <input
              type="checkbox"
              checked={activeMidiInputDevices.includes(midiDevice)}
              onChange={() => {
                if (activeMidiInputDevices.includes(midiDevice)) {
                  removeActiveMidiInputDevice(midiDevice);
                } else {
                  addActiveMidiInputDevice(midiDevice);
                }
              }}
            />
            {midiDevice}
          </label>
        ))}
      </div>
      <Modal
        onClose={stopEditingShortcut}
        isOpen={!!shortcutBeingEdited}
        depth={SHORTCUT_EDIT_MODAL_DEPTH}
      >
        {!!shortcutBeingEdited && (
          <div className="shortcut-controller__modal-contents">
            <p>Press key or change midi controller to save shortcut for:</p>
            <p>{getActionDecription(shortcutBeingEdited)}</p>
            <div className="shortcut-controller__shortcut-parameters">
              <SelectKnob
                items={SHORTCUT_TYPE_OPTIONS}
                label={shortcutBeingEdited.type ?? SHORTCUT_TYPE_OPTIONS[0].label ?? ''}
                type="discrete"
                value={shortcutBeingEdited.type}
                modalColumns={4}
                modalDepth={SHORTCUT_EDIT_MODAL_DEPTH + 1}
                onChange={(value) => updateShortcut(shortcutBeingEdited.id, { type: value })}
                clickOnModalButtonClosesModal
              />
              {shortcutBeingEdited.type === 'keyboard' && (
                <input
                  type="text"
                  value={`key: ${shortcutBeingEdited.key?.toLowerCase()}`}
                  onKeyDown={(e) => {
                    updateShortcut(shortcutBeingEdited.id, { key: e.key });
                    e.preventDefault();
                  }}
                  readOnly
                />
              )}
              {(shortcutBeingEdited.type === 'midi-note' ||
                shortcutBeingEdited.type === 'midi-cc') && (
                <>
                  <SelectKnobMidi
                    type="input"
                    value={shortcutBeingEdited.midiDevice}
                    onChange={(value) =>
                      updateShortcut(shortcutBeingEdited.id, { midiDevice: value })
                    }
                    modalDepth={SHORTCUT_EDIT_MODAL_DEPTH + 1}
                  />
                  <SelectKnob
                    label={`midi channel: ${shortcutBeingEdited.midiChannel}`}
                    max={MIDI_MAX_CHANNELS}
                    type="numeric"
                    value={shortcutBeingEdited.midiChannel}
                    onChange={(value) =>
                      updateShortcut(shortcutBeingEdited.id, { midiChannel: value })
                    }
                    clickOnModalButtonClosesModal
                    modalDepth={SHORTCUT_EDIT_MODAL_DEPTH + 1}
                  />
                  {shortcutBeingEdited.type === 'midi-note' && (
                    <SelectKnob
                      label={`midi note: ${shortcutBeingEdited.midiNote}`}
                      max={MIDI_MAX_NOTE}
                      type="numeric"
                      value={shortcutBeingEdited.midiNote}
                      onChange={(value) =>
                        updateShortcut(shortcutBeingEdited.id, { midiNote: value })
                      }
                      clickOnModalButtonClosesModal
                      modalDepth={SHORTCUT_EDIT_MODAL_DEPTH + 1}
                    />
                  )}
                  {shortcutBeingEdited.type === 'midi-cc' && (
                    <>
                      <SelectKnob
                        label={`midi cc: ${shortcutBeingEdited.midiControl}`}
                        max={MIDI_MAX_CC}
                        type="numeric"
                        value={shortcutBeingEdited.midiControl}
                        onChange={(value) =>
                          updateShortcut(shortcutBeingEdited.id, { midiControl: value })
                        }
                        clickOnModalButtonClosesModal
                        modalDepth={SHORTCUT_EDIT_MODAL_DEPTH + 1}
                      />
                      <SelectKnob
                        label={`range min: ${shortcutBeingEdited.valueRangeMin}`}
                        type="numeric"
                        value={shortcutBeingEdited.valueRangeMin}
                        min={shortcutBeingEdited.originalValueRangeMin}
                        max={shortcutBeingEdited.originalValueRangeMax}
                        step={getStepFromDecimalPlaces(shortcutBeingEdited.decimalPlaces)}
                        onChange={(value) =>
                          updateShortcut(shortcutBeingEdited.id, { valueRangeMin: value })
                        }
                        clickOnModalButtonClosesModal
                        modalDepth={SHORTCUT_EDIT_MODAL_DEPTH + 1}
                      />
                      <SelectKnob
                        label={`range max: ${shortcutBeingEdited.valueRangeMax}`}
                        type="numeric"
                        value={shortcutBeingEdited.valueRangeMax}
                        min={shortcutBeingEdited.originalValueRangeMin}
                        max={shortcutBeingEdited.originalValueRangeMax}
                        step={getStepFromDecimalPlaces(shortcutBeingEdited.decimalPlaces)}
                        onChange={(value) =>
                          updateShortcut(shortcutBeingEdited.id, { valueRangeMax: value })
                        }
                        clickOnModalButtonClosesModal
                        modalDepth={SHORTCUT_EDIT_MODAL_DEPTH + 1}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
