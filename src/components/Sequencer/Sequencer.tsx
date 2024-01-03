import React, { useEffect, useState } from "react";
import { SequencerChannel } from "./SequencerChannel/SequencerChannel";
require("./_Sequencer.scss");

export interface SequencerProps {
  nSteps: number;
  nChannels: number;
}

export const Sequencer: React.FC<SequencerProps> = ({ nSteps, nChannels }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [stepsPerBeat, setStepsPerBeat] = useState(4);

  useEffect(() => {
    setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % nSteps);
    }, 60000 / stepsPerBeat / bpm)
  }, [bpm]);

  const triggerHandler = (channelIndex: number) => {
    console.log(channelIndex);
  }

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
