import React from "react";
import { SequencerChannelStep } from "./SequencerChannelStep/SequencerChannelStep";
require("./_SequencerChannel.scss");

export interface SequencerChannelProps {
  nSteps: number;
  activeStepIndex: number;
  triggerCallback: () => void;
}

export const SequencerChannel: React.FC<SequencerChannelProps> = ({
  nSteps,
  activeStepIndex,
  triggerCallback,
}) => {
  return (
    <div className="sequencer-channel">
      {[...Array(nSteps).keys()].map((index) => (
        <SequencerChannelStep
          key={index}
          isActive={activeStepIndex === index}
          triggerCallback={triggerCallback}
        />
      ))}
    </div>
  );
};
