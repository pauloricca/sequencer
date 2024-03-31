import {
  IMIDIAccess,
  IMIDIInput,
  IMIDIOutput,
  MIDIVal,
  MIDIValInput,
  MIDIValOutput,
} from '@midival/core';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';

const MIDI_SEND_QUEUE_INTERVAL = 10;

/**
 * Message that can be sent to an output device
 */
interface MidiMessage {
  channel: number;
  note?: number;
  cc?: number;
  value?: number;
  velocity?: number;
  duration?: number;
  isNoteOff?: boolean;
  isMonophonic?: boolean;
}

/**
 * Event from an input device
 */
interface MidiEvent {
  type: 'note-on' | 'note-off' | 'cc';
  deviceName: string;
  channel: number;
  note?: number;
  control?: number;
  value?: number;
  velocity?: number;
}

interface MidiOutputDevice {
  messageQueue: MidiMessage[];
  output: MIDIValOutput;
  queueInterval: number | null;
  currentNotes: Array<{ note: number; noteOffTimeout: number }>;
}

interface MidiInputDevice {
  input: MIDIValInput;
}

export type MidiEventHandler = (event: MidiEvent) => void;

let midiAccess: IMIDIAccess | null = null;
const midiOutputDevices: Record<string, MidiOutputDevice> = {};
const midiInputDevices: Record<string, MidiInputDevice> = {};
let eventListeners: MidiEventHandler[] = [];

export const addMidiEventListener = (eventHandler: MidiEventHandler) => {
  if (!eventListeners.includes(eventHandler)) eventListeners.push(eventHandler);
};

export const removeMidiEventListener = (eventHandler: MidiEventHandler) => {
  if (eventListeners.includes(eventHandler))
    eventListeners = eventListeners.filter((handler) => handler !== eventHandler);
};

export const allSoundsOff = () =>
  Object.values(midiOutputDevices).forEach((device) => device.output?.sendAllNotesOff());

export const sendMidiMessage = (deviceName: string, message: MidiMessage) => {
  const device = midiOutputDevices[deviceName];

  if (!device) return;

  device.messageQueue.push(message);

  if (!device.queueInterval) {
    device.queueInterval = setInterval(() => {
      const message = device.messageQueue.pop();

      if (message && device.output) {
        if (message.note) {
          // Cancel previous note off timeouts
          device.currentNotes
            .filter((note) => note.note === message.note || message.isMonophonic)
            .forEach(({ noteOffTimeout }) => clearTimeout(noteOffTimeout));

          // Remove from currently played notes
          device.currentNotes = device.currentNotes.filter(
            (note) => note.note !== message.note || message.isMonophonic
          );

          if (message.isNoteOff) {
            device.output.sendNoteOff(message.note, message.channel);
          } else {
            device.output.sendNoteOn(message.note, message.velocity ?? 127, message.channel);

            // Remove any previous messages for this note
            device.messageQueue = device.messageQueue.filter(({ note }) => note !== message.note);

            // Schedule note off message
            if (message.duration) {
              const noteOffTimeout = setTimeout(() => {
                sendMidiMessage(deviceName, { ...message, isNoteOff: true });
              }, message.duration) as unknown as number;

              device.currentNotes.push({
                note: message.note,
                noteOffTimeout,
              });
            }
          }
        } else if (message.cc && message.value) {
          device.output!.sendControlChange(message.cc, message.value, message.channel);
        }
      } else {
        clearInterval(device.queueInterval!);
        device.queueInterval = null;
      }
    }, MIDI_SEND_QUEUE_INTERVAL) as unknown as number;
  }
};

const broadcastMidiEvent = (event: MidiEvent) =>
  eventListeners.forEach((eventListeners) => eventListeners(event));

MIDIVal.connect()
  .then((access) => {
    midiAccess = access;

    const setupMidiInputDevice = (iMidiInput: IMIDIInput) => {
      midiInputDevices[iMidiInput.name] = { input: new MIDIValInput(iMidiInput) };
      midiInputDevices[iMidiInput.name].input.onAllNoteOn(({ channel, note, velocity }) =>
        broadcastMidiEvent({
          deviceName: iMidiInput.name,
          channel,
          note,
          velocity,
          type: 'note-on',
        })
      );
      midiInputDevices[iMidiInput.name].input.onAllNoteOff(({ channel, note }) =>
        broadcastMidiEvent({ deviceName: iMidiInput.name, channel, note, type: 'note-off' })
      );
      midiInputDevices[iMidiInput.name].input.onAllControlChange(({ channel, control, value }) =>
        broadcastMidiEvent({ deviceName: iMidiInput.name, channel, control, value, type: 'cc' })
      );
    };

    midiAccess.inputs.forEach((input) => setupMidiInputDevice(input));
    midiAccess.onInputConnected(setupMidiInputDevice);

    midiAccess.onInputDisconnected((iMidiInput) => {
      delete midiInputDevices[iMidiInput.name];
    });

    const setupMidiOutputDevice = (iMidiOutput: IMIDIOutput) => {
      midiOutputDevices[iMidiOutput.name] = {
        messageQueue: [],
        output: new MIDIValOutput(iMidiOutput),
        queueInterval: null,
        currentNotes: [],
      };
    };

    midiAccess.outputs.forEach((output) => setupMidiOutputDevice(output));
    midiAccess.onOutputConnected(setupMidiOutputDevice);

    midiAccess.onOutputDisconnected((iMidiOutput) => {
      delete midiOutputDevices[iMidiOutput.name];
    });
  })
  .catch((e) => console.error(`Error connecting to MIDI devices: ${e}`));

export const useMidiDeviceNames = (type: 'input' | 'output') => {
  const [deviceNames, setDeviceNames] = useState<string[]>(
    type === 'input' ? Object.keys(midiInputDevices).sort() : Object.keys(midiOutputDevices).sort()
  );

  useEffect(() => {
    const waitForMidi = setInterval(() => {
      if (!midiAccess) return;

      clearInterval(waitForMidi);

      const resetDeviceNames = () => {
        if (!midiAccess) return;

        const newDeviceNames = (type === 'input' ? midiAccess.inputs : midiAccess.outputs)
          .map(({ name }) => name)
          .sort();

        setDeviceNames((previousDeviceNames) =>
          isEqual(previousDeviceNames, newDeviceNames) ? previousDeviceNames : newDeviceNames
        );
      };

      setDeviceNames(
        (type === 'input' ? midiAccess.inputs : midiAccess.outputs).map(({ name }) => name).sort()
      );

      midiAccess.onInputConnected(resetDeviceNames);
      midiAccess.onInputDisconnected(resetDeviceNames);
      midiAccess.onOutputConnected(resetDeviceNames);
      midiAccess.onOutputDisconnected(resetDeviceNames);
    }, 500);
  }, []);

  return deviceNames;
};
