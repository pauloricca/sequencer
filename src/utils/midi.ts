import {
  IMIDIAccess,
  IMIDIInput,
  IMIDIOutput,
  MIDIVal,
  MIDIValInput,
  MIDIValOutput,
} from '@midival/core';

const MIDI_SEND_QUEUE_INTERVAL = 10;

type MidiDeviceType = 'output' | 'input';

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

interface MidiDevice {
  type: MidiDeviceType;
  messageQueue: MidiMessage[];
  output: MIDIValOutput | null;
  input: MIDIValInput | null;
  queueInterval: number | null;
  currentNotes: Array<{ note: number; noteOffTimeout: number }>;
}

type MidiDevices = Record<string, MidiDevice>;
export type MidiEventHandler = (event: MidiEvent) => void;

let midiAccess: IMIDIAccess | null = null;
const midiDevices: MidiDevices = {};
let eventListeners: MidiEventHandler[] = [];

export const addMidiEventListener = (eventHandler: MidiEventHandler) => {
  if (!eventListeners.includes(eventHandler)) eventListeners.push(eventHandler);
};

export const removeMidiEventListener = (eventHandler: MidiEventHandler) => {
  if (eventListeners.includes(eventHandler))
    eventListeners = eventListeners.filter((handler) => handler !== eventHandler);
};

export const registerMidiDevice = (deviceName: string, type: MidiDeviceType) => {
  // Already registered?
  if (midiDevices[deviceName]) return;

  setupMidiDevice(deviceName, type);
};

export const unregisterMidiDevice = (deviceName: string, type: MidiDeviceType) => {
  if (midiDevices[deviceName]) {
    if (type === 'input') {
      midiDevices[deviceName].input?.disconnect();
      midiDevices[deviceName].input = null;
    } else {
      midiDevices[deviceName].output = null;
    }
    if (!midiDevices[deviceName].output && !midiDevices[deviceName].input) {
      delete midiDevices[deviceName];
    }
  }
};

export const allSoundsOff = () =>
  Object.values(midiDevices).forEach((device) => device.output?.sendAllNotesOff());

export const getMidiOutputDeviceNames = () =>
  midiAccess ? midiAccess.outputs.map(({ name }) => name) : [];

export const getMidiInputDeviceNames = () =>
  midiAccess ? midiAccess.inputs.map(({ name }) => name) : [];

export const sendMidiMessage = (deviceName: string, message: MidiMessage) => {
  if (!midiDevices[deviceName]) return;

  midiDevices[deviceName].messageQueue.push(message);

  if (!midiDevices[deviceName].queueInterval) {
    midiDevices[deviceName].queueInterval = setInterval(() => {
      const message = midiDevices[deviceName].messageQueue.pop();

      if (message && midiDevices[deviceName].output) {
        if (message.note) {
          // Cancel previous note off timeouts
          midiDevices[deviceName].currentNotes
            .filter((note) => note.note === message.note || message.isMonophonic)
            .forEach(({ noteOffTimeout }) => clearTimeout(noteOffTimeout));

          // Remove from currently played notes
          midiDevices[deviceName].currentNotes = midiDevices[deviceName].currentNotes.filter(
            (note) => note.note !== message.note || message.isMonophonic
          );

          if (message.isNoteOff) {
            midiDevices[deviceName].output!.sendNoteOff(message.note, message.channel);
          } else {
            midiDevices[deviceName].output!.sendNoteOn(
              message.note,
              message.velocity ?? 127,
              message.channel
            );

            // Remove any previous messages for this note
            midiDevices[deviceName].messageQueue = midiDevices[deviceName].messageQueue.filter(
              ({ note }) => note !== message.note
            );

            // Schedule note off message
            if (message.duration) {
              const noteOffTimeout = setTimeout(() => {
                sendMidiMessage(deviceName, { ...message, isNoteOff: true });
              }, message.duration) as any as number;

              midiDevices[deviceName].currentNotes.push({
                note: message.note,
                noteOffTimeout,
              });
            }
          }
        } else if (message.cc && message.value) {
          midiDevices[deviceName].output!.sendControlChange(
            message.cc,
            message.value,
            message.channel
          );
        }
      } else {
        clearInterval(midiDevices[deviceName].queueInterval!);
        midiDevices[deviceName].queueInterval = null;
      }
    }, MIDI_SEND_QUEUE_INTERVAL) as unknown as number;
  }
};

const broadcastMidiEvent = (event: MidiEvent) =>
  eventListeners.forEach((eventListeners) => eventListeners(event));

const setupMidiDevice = (deviceName: string, type: MidiDeviceType) => {
  if (midiAccess) {
    const device = (type === 'output' ? midiAccess.outputs : midiAccess.inputs).find(
      ({ name }) => name === deviceName
    );

    if (device) {
      if (!midiDevices[deviceName]) {
        midiDevices[deviceName] = getMidiDeviceDefaults(type);
      }

      if (type === 'output') {
        midiDevices[deviceName].output = new MIDIValOutput(device as IMIDIOutput);
      } else {
        midiDevices[deviceName].input = new MIDIValInput(device as IMIDIInput);
        midiDevices[deviceName].input?.onAllNoteOn(({ channel, note, velocity }) =>
          broadcastMidiEvent({ deviceName, channel, note, velocity, type: 'note-on' })
        );
        midiDevices[deviceName].input?.onAllNoteOff(({ channel, note }) =>
          broadcastMidiEvent({ deviceName, channel, note, type: 'note-off' })
        );
        midiDevices[deviceName].input?.onAllControlChange(({ channel, control, value }) =>
          broadcastMidiEvent({ deviceName, channel, control, value, type: 'cc' })
        );
      }
    }
  } else {
    midiDevices[deviceName] = getMidiDeviceDefaults(type);
  }
};

const getMidiDeviceDefaults = (type: MidiDeviceType): MidiDevice => ({
  type,
  messageQueue: [],
  output: null,
  input: null,
  queueInterval: null,
  currentNotes: [],
});

MIDIVal.connect()
  .then((access) => {
    midiAccess = access;
    console.log(
      'MIDI Output Devices',
      access.outputs.map(({ name }) => name)
    );
    console.log(
      'MIDI Input Devices',
      access.inputs.map(({ name }) => name)
    );

    Object.keys(midiDevices).forEach((deviceName) => {
      setupMidiDevice(deviceName, midiDevices[deviceName].type);
    });

    // output.sendControlChange(5, 50);
  })
  .catch((e) => console.log(e));
