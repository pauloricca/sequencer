import React from "react";
import { SequencerChannelStep } from "./SequencerChannelStep/SequencerChannelStep";
import { StateSequence, StateSequenceStep, useSequencersState } from "../../../State";
require("./_SequencerChannel.scss");

export interface SequencerChannelProps {
  sequence: StateSequence;
  channelIndex: number;
  nSteps: number;
  activeStepIndex: number;
}

export const SequencerChannel: React.FC<SequencerChannelProps> = ({
  sequence,
  channelIndex,
  nSteps,
  activeStepIndex,
}) => {
  const setStep = useSequencersState((state) => state.setStep(sequence.name));
  const removeStep = useSequencersState((state) => state.removeStep(sequence.name));

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

  return (
    <div className="sequencer-channel">
      {[...Array(nSteps).keys()].map((stepIndex) => {
        const step = steps.find((step) => step.stepIndex === stepIndex);
        return (
          <SequencerChannelStep
            step={step}
            key={stepIndex}
            isActive={activeStepIndex === stepIndex}
            onClick={() => onStepClickHandler(stepIndex, step)}
          />
        );
      })}
    </div>
  );
};
