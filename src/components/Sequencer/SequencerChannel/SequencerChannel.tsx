import React, { ReactNode, useCallback, useRef, useState } from "react";
import { SequencerChannelStep } from "./SequencerChannelStep/SequencerChannelStep";
import {
  StateSequence,
  StateSequenceChannelConfigCommon,
  StateSequenceStep,
  StateSequenceStepProperties,
} from "../../../state/state.types";
import { useSequencersState } from "../../../state/state";
import { Icon } from "@blueprintjs/core";
import classNames from "classnames";
require("./_SequencerChannel.scss");

export interface SequencerChannelProps {
  sequence: StateSequence;
  channelConfig: StateSequenceChannelConfigCommon;
  channelIndex: number;
  activeStepIndex: number;
  visiblePage: number;
  triggerCallback?: (channel: number, step?: StateSequenceStep) => void;
  showChannelControls?: boolean;
  channelConfigComponents?: (channelIndex: number) => ReactNode;
  stepPropertyCurrentlyBeingEdited: keyof StateSequenceStepProperties | null;
}

export const SequencerChannel: React.FC<SequencerChannelProps> = ({
  sequence,
  channelConfig,
  channelIndex,
  activeStepIndex,
  visiblePage,
  triggerCallback = () => {},
  showChannelControls = false,
  channelConfigComponents,
  stepPropertyCurrentlyBeingEdited,
}) => {
  const setStep = useSequencersState((state) => state.setStep(sequence.name));
  const removeStep = useSequencersState((state) =>
    state.removeStep(sequence.name)
  );
  const updateChannelConfig = useSequencersState((state) =>
    state.updateChannelConfig(sequence.name)(channelIndex)
  );
  const updateStep = useSequencersState((state) =>
    state.updateStep(sequence.name)
  );
  const [isDraggingAlongChannel, setIsDraggingAlongChannel] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // To use inside the callback
  const visiblePageRef = useRef(visiblePage);
  visiblePageRef.current = visiblePage;

  if (channelConfig.isHidden) return null;

  const channelStepsByIndex = [...Array(sequence.nSteps).keys()].map(
    (stepIndex) =>
      sequence.patterns[sequence.currentPattern].pages[visiblePage].steps.find(
        (step) => step.stepIndex === stepIndex && step.channel === channelIndex
      )
  );

  const onStepToggleHandler = useCallback((
    stepIndex: number,
    currentStep?: StateSequenceStep
  ) => {
    if (currentStep) {
      removeStep(currentStep, visiblePageRef.current);
    } else {
      setStep({
        channel: channelIndex,
        stepIndex,
      }, visiblePageRef.current);
    }
  }, []);

  const onDragStartHandler = useCallback(() => {
    setIsDraggingAlongChannel(true);
    const mouseUpHandler = () => {
      setIsDraggingAlongChannel(false);
      window.removeEventListener("mouseup", mouseUpHandler);
    };
    window.addEventListener("mouseup", mouseUpHandler);
  }, []);

  const onFillPercentageChangeHandler = useCallback(
    (value: number, step?: StateSequenceStep) =>
      step &&
      stepPropertyCurrentlyBeingEdited &&
      updateStep(
        step,
        visiblePageRef.current
      )({
        [stepPropertyCurrentlyBeingEdited]: value,
      }),
    [stepPropertyCurrentlyBeingEdited]
  );

  return (
    <div
      className={classNames("sequencer-channel", {
        "sequencer-channel--is-muted": channelConfig.isMuted || sequence.isMuted,
      })}
    >
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
              stepIndex={stepIndex}
              step={step}
              isActive={activeStepIndex === stepIndex && !channelConfig.isMuted}
              onToggle={onStepToggleHandler}
              onDragStart={onDragStartHandler}
              isDraggingAlongChannel={isDraggingAlongChannel}
              isControllingFillPercentage={!!stepPropertyCurrentlyBeingEdited}
              fillPercentage={
                stepPropertyCurrentlyBeingEdited
                  ? step?.[stepPropertyCurrentlyBeingEdited]
                  : undefined
              }
              onFillPercentageChange={
                stepPropertyCurrentlyBeingEdited ? onFillPercentageChangeHandler : undefined
              }
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
