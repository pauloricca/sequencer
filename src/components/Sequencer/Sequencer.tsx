import React, { useEffect } from "react";
import { SequencerChannel } from "./SequencerChannel/SequencerChannel";
import { StateSequence } from "../../State";
require("./_Sequencer.scss");

export interface SequencerProps {
  sequence: StateSequence;
  clock: number;
  triggerCallback: (channel: number) => void;
}

export const Sequencer: React.FC<SequencerProps> = ({
  sequence,
  clock,
  triggerCallback,
}) => {
  const activeStepIndex = clock % sequence.nSteps;

  useEffect(() => {
    const stepsToTrigger = sequence.steps.filter(
      ({ stepIndex }) => stepIndex === activeStepIndex
    );
    stepsToTrigger.forEach((step) => triggerCallback(step.channel));
  }, [activeStepIndex]);

  return (
    <div className="sequencer">
      {[...Array(sequence.nChannels).keys()].map((channelIndex) => (
        <SequencerChannel
          channelIndex={channelIndex}
          sequence={sequence}
          key={channelIndex}
          nSteps={sequence.nSteps}
          activeStepIndex={activeStepIndex}
        />
      ))}
    </div>
  );
};
