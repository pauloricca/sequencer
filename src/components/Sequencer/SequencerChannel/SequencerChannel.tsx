import React, { ReactNode, useState } from "react";
import { SequencerChannelStep } from "./SequencerChannelStep/SequencerChannelStep";
import {
  StateSequence,
  StateSequenceChannelConfig,
  StateSequenceStep,
} from "../../../state/state.types";
import { useSequencersState } from "../../../state/state";
import { Icon } from "@blueprintjs/core";
require("./_SequencerChannel.scss");

export interface SequencerChannelProps {
  sequence: StateSequence;
  channelConfig: StateSequenceChannelConfig;
  channelIndex: number;
  activeStepIndex: number;
  triggerCallback?: (channel: number) => void;
  showChannelControls?: boolean;
  channelConfigComponents?: (channelIndex: number) => ReactNode;
}

export const SequencerChannel: React.FC<SequencerChannelProps> = ({
  sequence,
  channelConfig,
  channelIndex,
  activeStepIndex,
  triggerCallback = () => {},
  showChannelControls = false,
  channelConfigComponents,
}) => {
  const setStep = useSequencersState((state) => state.setStep(sequence.name));
  const removeStep = useSequencersState((state) =>
    state.removeStep(sequence.name)
  );
  const updateChannelConfig = useSequencersState((state) =>
    state.updateChannelConfig(sequence.name)(channelIndex)
  );
  const [isDraggingAlongChannel, setIsDraggingAlongChannel] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  if (channelConfig.isHidden) return null;

  const channelStepsByIndex = [...Array(sequence.nSteps).keys()].map(
    (stepIndex) =>
      sequence.patterns[sequence.currentPattern].steps.find(
        (step) => step.stepIndex === stepIndex && step.channel === channelIndex
      )
  );

  const onStepClickHandler = (
    stepIndex: number,
    currentStep?: StateSequenceStep
  ) => {
    if (currentStep) {
      removeStep(currentStep);
    } else {
      setStep({
        channel: channelIndex,
        stepIndex,
      });
    }
  };

  const onDragStartHandler = () => {
    setIsDraggingAlongChannel(true);
    const mouseUpHandler = () => {
      setIsDraggingAlongChannel(false);
      window.removeEventListener("mouseup", mouseUpHandler);
    };
    window.addEventListener("mouseup", mouseUpHandler);
  };

  return (
    <div className="sequencer-channel">
      <div className="sequencer-channel__inner">
        <div
          className="sequencer-channel__name"
          onClick={() => triggerCallback(channelIndex)}
        >
          {channelConfig.name}
        </div>
        {showChannelControls && (
          <div className="sequencer-channel__controls">
            {!!channelConfigComponents && isConfigOpen && (
              <Icon icon="cross" onClick={() => setIsConfigOpen(false)} />
            )}
            {!!channelConfigComponents && !isConfigOpen && (
              <Icon icon="cog" onClick={() => setIsConfigOpen(true)} />
            )}
            {!channelConfig.isMuted && (
              <Icon
                icon="volume-up"
                onClick={() => updateChannelConfig({ isMuted: true })}
              />
            )}
            {channelConfig.isMuted && (
              <Icon
                icon="volume-off"
                onClick={() => updateChannelConfig({ isMuted: false })}
              />
            )}
          </div>
        )}
        <div className="sequencer-channel__steps">
          {channelStepsByIndex.map((step, stepIndex) => (
            <SequencerChannelStep
              key={stepIndex}
              isToggled={!!step}
              isActive={activeStepIndex === stepIndex && !channelConfig.isMuted}
              onToggle={() => onStepClickHandler(stepIndex, step)}
              onDragStart={onDragStartHandler}
              isDraggingAlongChannel={isDraggingAlongChannel}
            />
          ))}
        </div>
      </div>
      {isConfigOpen && channelConfigComponents && (
        <div className="sequencer-channel__config">
          {channelConfigComponents(channelIndex)}
        </div>
      )}
    </div>
  );
};
