import React, { useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";
import { SequencerChannel } from "./SequencerChannel/SequencerChannel";
require("./_Sequencer.scss");

export interface SequencerProps {
  nSteps: number;
  nChannels: number;
}

const SAMPLES = [
  "SS_TCN_Kick_Solo_01.wav",
  "SS_TCN_Clap_Snare_15.wav",
  "SS_TCN_HH_03.wav",
  "SS_TCN_HH_44.wav",
  "SS_TCN_Clap_Snare_04.wav",
];

export const Sequencer: React.FC<SequencerProps> = ({ nSteps, nChannels }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [stepsPerBeat, setStepsPerBeat] = useState(4);
  const samples = useRef<Howl[]>([]);

  useEffect(() => {
    samples.current = SAMPLES.map((sample) => new Howl({
      src: [`/sounds/${sample}`]
    }));
  }, []);

  useEffect(() => {
    setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % nSteps);
    }, 60000 / stepsPerBeat / bpm);
  }, [bpm]);

  const triggerHandler = (channelIndex: number) => {
    samples.current[channelIndex]?.play();
  };

  return (
    <div className="sequencer">
      {[...Array(nChannels).keys()].map((index) => (
        <SequencerChannel
          key={index}
          nSteps={nSteps}
          activeStepIndex={activeStepIndex}
          triggerCallback={() => triggerHandler(index)}
        />
      ))}
    </div>
  );
};
