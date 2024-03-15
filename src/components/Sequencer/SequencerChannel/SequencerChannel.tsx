import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { SequencerChannelStep } from './SequencerChannelStep/SequencerChannelStep';
import {
  StateSequence,
  StateSequenceChannelConfigCommon,
  StateSequenceStep,
  StateSequenceStepProperties,
} from 'state/state.types';
import { useSequencersState } from 'state/state';
import { Icon } from '@blueprintjs/core';
import classNames from 'classnames';
require('./_SequencerChannel.scss');

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
  const setStep = useSequencersState((state) => state.setStep);
  const removeStep = useSequencersState((state) => state.removeStep);
  const updateChannelConfig = useSequencersState((state) => state.updateChannelConfig);
  const updateStep = useSequencersState((state) => state.updateStep);
  const [isDraggingAlongChannel, setIsDraggingAlongChannel] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // To use inside the callback
  const visiblePageRef = useRef(visiblePage);

  visiblePageRef.current = visiblePage;

  if (channelConfig.isHidden) return null;

  const channelStepsByIndex = [...Array(sequence.nSteps).keys()].map((stepIndex) =>
    sequence.patterns[sequence.currentPattern].pages[visiblePage].steps.find(
      (step) => step.stepIndex === stepIndex && step.channel === channelIndex
    )
  );

  const onStepToggleHandler = useCallback((stepIndex: number, currentStep?: StateSequenceStep) => {
    if (currentStep) {
      removeStep(sequence.name)(currentStep, visiblePageRef.current);
    } else {
      setStep(sequence.name)(
        {
          channel: channelIndex,
          stepIndex,
        },
        visiblePageRef.current
      );
    }
  }, []);

  const onDragStartHandler = useCallback(() => {
    setIsDraggingAlongChannel(true);
    const mouseUpHandler = () => {
      setIsDraggingAlongChannel(false);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mouseup', mouseUpHandler);
  }, []);

  const onFillPercentageChangeHandler = useCallback(
    (value: number, step?: StateSequenceStep) =>
      step &&
      stepPropertyCurrentlyBeingEdited &&
      updateStep(sequence.name)(step, visiblePageRef.current)({
        [stepPropertyCurrentlyBeingEdited]: value,
      }),
    [stepPropertyCurrentlyBeingEdited]
  );

  const channelControls = useMemo(
    () => (
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
            onClick={() => updateChannelConfig(sequence.name)(channelIndex)({ isMuted: true })}
          />
        )}
        {channelConfig.isMuted && (
          <Icon
            icon="volume-off"
            onClick={() => updateChannelConfig(sequence.name)(channelIndex)({ isMuted: false })}
          />
        )}
      </div>
    ),
    [isConfigOpen, channelConfig.isMuted]
  );

  return (
    <div
      className={classNames('sequencer-channel', {
        'sequencer-channel--is-muted': channelConfig.isMuted || sequence.isMuted,
      })}
    >
      <div className="sequencer-channel__inner">
        <div className="sequencer-channel__name" onClick={() => triggerCallback(channelIndex)}>
          {channelConfig.name}
        </div>
        {showChannelControls && channelControls}
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
        <div className="sequencer-channel__config">{channelConfigComponents(channelIndex)}</div>
      )}
    </div>
  );
};
