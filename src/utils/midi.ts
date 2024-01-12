import { IMIDIAccess, MIDIVal, MIDIValOutput } from "@midival/core";

const MIDI_SEND_QUEUE_INTERVAL = 30;
const MIDI_NOTE_OFF_ON_INTERVAL = 10;

interface MidiMessage {
  channel: number;
  note: number;
  velocity: number;
}

interface MidiDevices {
  [name: string]: {
    type: "input" | "output";
    messageQueue: MidiMessage[];
    output: MIDIValOutput | null;
    queueInterval: number | null;
    currentNotes: number[];
  };
}

let midiAccess: IMIDIAccess | null = null;
const midiDevices: MidiDevices = {};

export const registerMidiOutputDevice = (deviceName: string) => {
  // Already registered?
  if (midiDevices[deviceName]) return;

  setupMidiOutputDevice(deviceName);
};

const setupMidiOutputDevice = (deviceName: string) => {
  if (midiAccess) {
    const midiOutputToUse = midiAccess.outputs.find(
      ({ name }) => name === deviceName
    );

    if (midiOutputToUse) {
      midiDevices[deviceName].output = new MIDIValOutput(midiOutputToUse);
    }
  } else {
    midiDevices[deviceName] = {
      type: "output",
      messageQueue: [],
      output: null,
      queueInterval: null,
      currentNotes: [],
    };
  }
};

export const sendMidiMessage = (deviceName: string, message: MidiMessage) => {
  if (!midiDevices[deviceName]) return;

  midiDevices[deviceName].messageQueue.push(message);

  console.log(midiDevices[deviceName].currentNotes);

  if (midiDevices[deviceName].queueInterval === null) {
    midiDevices[deviceName].queueInterval = setInterval(() => {
      const message = midiDevices[deviceName].messageQueue.pop();

      if (message && midiDevices[deviceName].output !== null) {
        // If note is playing already, switch it off first
        if (midiDevices[deviceName].currentNotes.includes(message.note)) {
          (midiDevices[deviceName].output as MIDIValOutput).sendNoteOff(
            message.note,
            message.channel
          );
          setTimeout(() => {
            (midiDevices[deviceName].output as MIDIValOutput).sendNoteOn(
              message.note,
              message.velocity,
              message.channel
            );
          }, MIDI_NOTE_OFF_ON_INTERVAL);
        } else {
          (midiDevices[deviceName].output as MIDIValOutput).sendNoteOn(
            message.note,
            message.velocity,
            message.channel
          );
          midiDevices[deviceName].currentNotes.push(message.note);
        }

        // TODO: Add note length instead of 500
        setTimeout(() => {
          (midiDevices[deviceName].output as MIDIValOutput).sendNoteOff(
            message.note,
            message.channel
          );
          midiDevices[deviceName].currentNotes = midiDevices[
            deviceName
          ].currentNotes.filter((note) => note !== message.note);
        }, 500);
      } else {
        clearInterval(midiDevices[deviceName].queueInterval as number);
        midiDevices[deviceName].queueInterval = null;
      }
    }, MIDI_SEND_QUEUE_INTERVAL) as unknown as number;
  }
};

MIDIVal.connect().then((access) => {
  midiAccess = access;
  console.log(
    "MIDI Output Devices",
    access.outputs.map(({ name }) => name)
  );

  Object.keys(midiDevices).forEach((deviceName) => {
    if (midiDevices[deviceName].type === "output") {
      setupMidiOutputDevice(deviceName);
    }
  });

  // output.sendControlChange(5, 50);
});
