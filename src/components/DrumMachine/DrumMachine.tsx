import React, { useEffect, useRef } from "react";
import { Howl } from "howler";
import { Sequencer, SequencerProps } from "../Sequencer/Sequencer";
import { MIDIVal, MIDIValOutput } from "@midival/core";

export interface DrumMachineProps extends Omit<SequencerProps, 'triggerCallback'> {}

const SAMPLES = [
  "SS_TCN_Kick_Solo_01.wav",
  "SS_TCN_Kick_Solo_31.wav",
  "SS_TCN_Clap_Snare_15.wav",
  "SS_TCN_HH_03.wav",
  "SS_TCN_HH_05.wav",
  "SS_TCN_Clap_Snare_04.wav",
];

export const DrumMachine: React.FC<DrumMachineProps> = ({ sequence, clock }) => {
  const samples = useRef<Howl[]>([]);
  const midiOutput = useRef<MIDIValOutput>();

  useEffect(() => {
    samples.current = SAMPLES.map((sample) => new Howl({
      src: [`/sounds/${sample}`]
    }));

    MIDIVal.connect()
    .then(access => {
        console.log('paulo midi', access.outputs);
        midiOutput.current = new MIDIValOutput(access.outputs[1]);
        // output.sendControlChange(5, 50);
    });
  }, []);

  const triggerSample = (sampleIndex: number) => {
    samples.current[sampleIndex]?.play();

    const notes = [36, 38, 43, 50, 42, 46, 39, 75, 67, 49];

    if (midiOutput.current) {
      midiOutput.current.sendNoteOn(notes[sampleIndex], 127, 10);
    }
  };

  return (
    <div className="drum-machine instrument">
        <Sequencer
          sequence={sequence}
          clock={clock}
          triggerCallback={triggerSample}
        />
    </div>
  );
};
