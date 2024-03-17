import { Icon } from '@blueprintjs/core';
import { Modal } from 'components/Modal/Modal';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSequencersState } from 'state/state';
import { StateShortcut } from 'state/state.types';
import {
  MidiEventHandler,
  addMidiEventListener,
  getMidiInputDeviceNames,
  registerMidiDevice,
  removeMidiEventListener,
  unregisterMidiDevice,
} from 'utils/midi';
require('./_ShortcutController.scss');

export const ShortcutController: React.FC = () => {
  const shortcuts = useSequencersState((state) => state.shortcuts);
  const shortcutsRef = useRef(shortcuts);
  const saveNewShortcut = useSequencersState((state) => state.saveNewShortcut);
  const stopListeningToNewShortcut = useSequencersState(
    (state) => state.stopListeningToNewShortcut
  );
  const performAction = useSequencersState((state) => state.performAction);
  const removeShortcut = useSequencersState((state) => state.removeShortcut);
  const activeMidiInputDevices = useSequencersState((state) => state.activeMidiInputDevices);
  const addActiveMidiInputDevice = useSequencersState((state) => state.addActiveMidiInputDevice);
  const removeActiveMidiInputDevice = useSequencersState(
    (state) => state.removeActiveMidiInputDevice
  );
  const [availableMidiInputDevices, setAvailableMidiInputDevices] = useState<string[]>([]);

  const shortcutCurrentlyBeingAssigned = shortcuts.find(
    ({ type }) => type === 'currently-being-assigned'
  );

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    activeMidiInputDevices.forEach((deviceName) => registerMidiDevice(deviceName, 'input'));
  }, [activeMidiInputDevices]);

  useEffect(() => {
    document.addEventListener('keypress', keyPressedHandler);
    addMidiEventListener(midiEventHandler);

    const midiDeviceCheckInterval = setInterval(() => {
      setAvailableMidiInputDevices(getMidiInputDeviceNames());
    }, 5000);

    setAvailableMidiInputDevices(getMidiInputDeviceNames());

    return () => {
      clearInterval(midiDeviceCheckInterval);
      document.removeEventListener('keypress', keyPressedHandler);
      removeMidiEventListener(midiEventHandler);
    };
  }, []);

  const midiEventHandler: MidiEventHandler = useCallback((event) => {
    if (event.type !== 'note-on' && event.type !== 'cc') {
      return;
    }

    const shortcutCurrentlyBeingAssigned = shortcutsRef.current.find(
      ({ type }) => type === 'currently-being-assigned'
    );

    if (!shortcutCurrentlyBeingAssigned) {
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
    } else {
      saveNewShortcut({
        ...shortcutCurrentlyBeingAssigned,
        type: event.type === 'note-on' ? 'midi-note' : 'midi-cc',
        midiDevice: event.deviceName,
        midiNote: event.note,
        midiControl: event.control,
        midiChannel: event.channel,
      });
      stopListeningToNewShortcut();
    }
  }, []);

  const keyPressedHandler = useCallback((e: KeyboardEvent) => {
    const pressedKey = e.key;
    const pressedKeyCode = e.charCode ?? e.keyCode ?? e.which ?? 0;

    const shortcutCurrentlyBeingAssigned = shortcutsRef.current.find(
      ({ type }) => type === 'currently-being-assigned'
    );

    if (!shortcutCurrentlyBeingAssigned) {
      shortcutsRef.current
        .filter(({ type, key }) => type === 'keyboard' && key === pressedKey)
        .forEach(({ actionMessage }) => performAction(actionMessage));
    } else {
      saveNewShortcut({
        ...shortcutCurrentlyBeingAssigned,
        actionMessage: {
          ...shortcutCurrentlyBeingAssigned.actionMessage,
          value: shortcutCurrentlyBeingAssigned.actionMessage.value ?? pressedKeyCode,
        },
        type: 'keyboard',
        key: pressedKey,
      });
      stopListeningToNewShortcut();
    }
  }, []);

  const getActionDecription = (shortcut: StateShortcut) =>
    Object.values(shortcut.actionMessage).join(' – ');

  const getTriggerDecription = (shortcut: StateShortcut) =>
    [
      shortcut.key ? `key:${shortcut.key}` : '',
      shortcut.midiDevice,
      shortcut.midiChannel ? `ch:${shortcut.midiChannel}` : '',
      shortcut.midiControl ? `cc:${shortcut.midiControl}` : '',
      shortcut.midiNote ? `note:${shortcut.midiNote}` : '',
    ]
      .filter(Boolean)
      .join(', ');

  const allMidiDevices = [...availableMidiInputDevices].sort();

  return (
    <div className="shortcut-controller">
      <div className="shortcut-controller__section">
        <p className="shortcut-controller__section-header">Shortcuts</p>
        {shortcuts.map((shortcut, shortcutIndex) => (
          <p className="shortcut-controller__item" key={shortcutIndex}>
            <Icon
              icon="trash"
              className="shortcut-controller__remove-shortcut-button"
              onClick={() => removeShortcut(shortcut)}
            />
            {getTriggerDecription(shortcut)} – {getActionDecription(shortcut)}
          </p>
        ))}
      </div>
      <div className="shortcut-controller__section">
        <p className="shortcut-controller__section-header">Active MIDI Input Devices</p>
        {allMidiDevices.map((midiDevice) => (
          <label className="shortcut-controller__item" key={midiDevice}>
            <input
              type="checkbox"
              checked={activeMidiInputDevices.includes(midiDevice)}
              onChange={() => {
                if (activeMidiInputDevices.includes(midiDevice)) {
                  removeActiveMidiInputDevice(midiDevice);
                  unregisterMidiDevice(midiDevice, 'input');
                } else {
                  addActiveMidiInputDevice(midiDevice);
                }
              }}
            />
            {midiDevice}
          </label>
        ))}
      </div>
      <Modal isOpen={!!shortcutCurrentlyBeingAssigned}>
        <div className="shortcut-controller__overlay">
          <p>Press key or change midi controller to save shortcut for:</p>
          <p>
            {!!shortcutCurrentlyBeingAssigned &&
              getActionDecription(shortcutCurrentlyBeingAssigned)}
          </p>
        </div>
      </Modal>
    </div>
  );
};
