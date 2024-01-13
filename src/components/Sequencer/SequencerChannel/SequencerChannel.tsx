import React, { useState } from "react";
import { SequencerChannelStep } from "./SequencerChannelStep/SequencerChannelStep";
import { StateSequence, StateSequenceChannelConfig, StateSequenceStep } from "src/state/state.types";
import { useSequencersState } from "../../../state/state";
require("./_SequencerChannel.scss");

export interface SequencerChannelProps {
  sequence: StateSequence;
  channelConfig: StateSequenceChannelConfig;
  channelIndex: number;
  nSteps: number;
  activeStepIndex: number;
}

export const SequencerChannel: React.FC<SequencerChannelProps> = ({
  sequence,
  channelConfig,
  channelIndex,
  nSteps,
  activeStepIndex,
}) => {
  const setStep = useSequencersState((state) => state.setStep(sequence.name));
  const removeStep = useSequencersState((state) => state.removeStep(sequence.name));
  const [isDraggingAlongChannel, setIsDraggingAlongChannel] = useState(false);

  const steps = sequence.steps.filter(
    ({ channel }) => channel === channelIndex
  )

  const onStepClickHandler = (stepIndex: number, currentStep?: StateSequenceStep) => {
    if (currentStep) {
      removeStep(currentStep);
    } else {
      setStep({
        channel: channelIndex,
        stepIndex
      });
    }
  };

  const onDragStartHandler = () => {
    setIsDraggingAlongChannel(true);
    const mouseUpHandler = () => {
      setIsDraggingAlongChannel(false);
      document.body.removeEventListener("mouseup", mouseUpHandler);
    };
    document.body.addEventListener("mouseup", mouseUpHandler);
  };

  return (
    <div className="sequencer-channel">
      <div className="sequencer-channel__name">{channelConfig.name}</div>
      {[...Array(nSteps).keys()].map((stepIndex) => {
        const step = steps.find((step) => step.stepIndex === stepIndex);
        return (
          <SequencerChannelStep
            key={stepIndex}
            isToggled={!!step}
            isActive={activeStepIndex === stepIndex}
            onToggle={() => onStepClickHandler(stepIndex, step)}
            onDragStart={onDragStartHandler}
            isDraggingAlongChannel={isDraggingAlongChannel}
          />
        );
      })}
    </div>
  );
};
