import { IMIDIAccess, MIDIVal, MIDIValOutput } from "@midival/core";

const MIDI_SEND_QUEUE_INTERVAL = 10;

interface MidiMessage {
  channel: number;
  note: number;
  velocity: number;
  duration: number;
  isNoteOff?: boolean;
}

interface MidiDevice {
  type: "input" | "output";
  messageQueue: MidiMessage[];
  output: MIDIValOutput | null;
  queueInterval: number | null;
  currentNotes: {note: number; noteOffTimeout: number}[];
}

interface MidiDevices {
  [name: string]: MidiDevice;
}

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

  if (midiDevices[deviceName].queueInterval === null) {
    midiDevices[deviceName].queueInterval = setInterval(() => {
      const message = midiDevices[deviceName].messageQueue.pop();

      if (message && midiDevices[deviceName].output !== null) {
        // console.log('PROCESSING MESSAGE', message);
        // console.log('BEFORE');
        // console.log('queue', midiDevices[deviceName].messageQueue);
        // console.log('current', midiDevices[deviceName].currentNotes);
        if (message.isNoteOff) {
          // console.log('OFF', message.note, "is note off");
          (midiDevices[deviceName].output as MIDIValOutput).sendNoteOff(
            message.note,
            message.channel
          );

          // Cancel previous note off timeout
          const previousNoteOffTimeout = midiDevices[
            deviceName
          ].currentNotes.find(
            (note) => note.note === message.note
          )?.noteOffTimeout;
          // console.log('CLEARING INTERVAL', previousNoteOffTimeout);
          previousNoteOffTimeout && clearTimeout(previousNoteOffTimeout);

          // Remove from currently played notes
          midiDevices[deviceName].currentNotes = midiDevices[
            deviceName
          ].currentNotes.filter((note) => note.note !== message.note);
        // }
        // If note is playing already, switch it off first
        // else if (midiDevices[deviceName].currentNotes.find((note) => note.note === message.note)) {
        //   console.log('OFF', message.note, "was playing already");
        //   (midiDevices[deviceName].output as MIDIValOutput).sendNoteOff(
        //     message.note,
        //     message.channel
        //   );

        //   // Cancel previous note off timeout
        //   const previousNoteOffTimeout = midiDevices[
        //     deviceName
        //   ].currentNotes.find(
        //     (note) => note.note === message.note
        //   )?.noteOffTimeout;
        //   previousNoteOffTimeout && clearTimeout(previousNoteOffTimeout);

        //   // Remove from currently played notes
        //   midiDevices[deviceName].currentNotes = midiDevices[
        //     deviceName
        //   ].currentNotes.filter((note) => note.note !== message.note);

        //   // Remove any previous messages for this note
        //   midiDevices[deviceName].messageQueue = midiDevices[
        //     deviceName
        //   ].messageQueue.filter((message) => message.note !== message.note);

        //   // Put original message back in the queue
        //   sendMidiMessage(deviceName, message);
        } else {
          // console.log('ON', message.note, message.duration);
          (midiDevices[deviceName].output as MIDIValOutput).sendNoteOn(
            message.note,
            message.velocity,
            message.channel
          );

          // Cancel previous note off timeout
          const previousNoteOffTimeout = midiDevices[
            deviceName
          ].currentNotes.find(
            (note) => note.note === message.note
          )?.noteOffTimeout;
          // console.log('CLEARING INTERVAL', previousNoteOffTimeout);
          previousNoteOffTimeout && clearTimeout(previousNoteOffTimeout);

          // Remove any previous messages for this note
          midiDevices[deviceName].messageQueue = midiDevices[
            deviceName
          ].messageQueue.filter((message) => message.note !== message.note);

          // Remove from current noted
          midiDevices[deviceName].currentNotes = midiDevices[
            deviceName
          ].currentNotes.filter((note) => note.note !== message.note);

          // Schedule note off message
          const noteOffTimeout = (setTimeout(() => {
            sendMidiMessage(deviceName, {...message, isNoteOff: true});
          }, message.duration) as any as number);
          midiDevices[deviceName].currentNotes.push({
            note: message.note,
            noteOffTimeout,
          });
        }
        // console.log('AFTER');
        // console.log('queue', midiDevices[deviceName].messageQueue);
        // console.log('current', midiDevices[deviceName].currentNotes);
      } else {
        clearInterval(midiDevices[deviceName].queueInterval as number);
        midiDevices[deviceName].queueInterval = null;
      }
    }, MIDI_SEND_QUEUE_INTERVAL) as unknown as number;
  }
};

const setupMidiOutputDevice = (deviceName: string) => {
  if (midiAccess) {
    const midiOutputToUse = midiAccess.outputs.find(
      ({ name }) => name === deviceName
    );

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
  type: "output",
  messageQueue: [],
  output: null,
  queueInterval: null,
  currentNotes: [],
});

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
