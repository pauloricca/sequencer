import { IMIDIAccess, MIDIVal, MIDIValOutput } from '@midival/core';

const MIDI_SEND_QUEUE_INTERVAL = 10;

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

interface MidiDevice {
  type: 'input' | 'output';
  messageQueue: MidiMessage[];
  output: MIDIValOutput | null;
  queueInterval: number | null;
  currentNotes: Array<{ note: number; noteOffTimeout: number }>;
}

type MidiDevices = Record<string, MidiDevice>;

let midiAccess: IMIDIAccess | null = null;
const midiDevices: MidiDevices = {};

export const registerMidiOutputDevice = (deviceName: string) => {
  // Already registered?
  if (midiDevices[deviceName]) return;

  setupMidiOutputDevice(deviceName);
};

export const unregisterMidiOutputDevice = (deviceName: string) => {
  delete midiDevices[deviceName];
};

export const getMidiOutputDeviceNames = () =>
  midiAccess ? midiAccess.outputs.map(({ name }) => name) : [];

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

const setupMidiOutputDevice = (deviceName: string) => {
  if (midiAccess) {
    const midiOutputToUse = midiAccess.outputs.find(({ name }) => name === deviceName);

    if (midiOutputToUse) {
      if (!midiDevices[deviceName]) {
        midiDevices[deviceName] = getMidiDevideDefaults();
      }

      midiDevices[deviceName].output = new MIDIValOutput(midiOutputToUse);
    }
  } else {
    midiDevices[deviceName] = getMidiDevideDefaults();
  }
};

const getMidiDevideDefaults = (): MidiDevice => ({
  type: 'output',
  messageQueue: [],
  output: null,
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

    Object.keys(midiDevices).forEach((deviceName) => {
      if (midiDevices[deviceName].type === 'output') {
        setupMidiOutputDevice(deviceName);
      }
    });

    // output.sendControlChange(5, 50);
  })
  .catch((e) => console.log(e));
