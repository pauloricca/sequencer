import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import {
  SequencerChannelStep,
  SequencerChannelStepProps,
} from './SequencerChannelStep/SequencerChannelStep';
import {
  StateSequence,
  StateSequenceChannelConfigCommon,
  StateSequenceStep,
  StateSequenceStepProperties,
} from 'state/state.types';
import { useSequencersState } from 'state/state';
import { Icon } from '@blueprintjs/core';
import classNames from 'classnames';
import {
  DEFAULT_STEP_VALUES,
  MAX_STEP_VALUES,
} from 'components/Sequencer/SequencerChannel/SequencerChannel.constants';
import { getCurrentPattern } from 'state/state.utils';
require('./_SequencerChannel.scss');

export interface SequencerChannelProps
  extends Pick<SequencerChannelStepProps, 'stepPropertyEditDirection'> {
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
  stepPropertyEditDirection,
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
    getCurrentPattern(sequence).pages[visiblePage].steps.find(
      (step) => step.stepIndex === stepIndex && step.channel === channelIndex
    )
  );

  const onStepToggleHandler = useCallback((stepIndex: number, currentStep?: StateSequenceStep) => {
    if (currentStep) {
      removeStep(sequence.id, currentStep, visiblePageRef.current);
    } else {
      setStep(
        sequence.id,
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
      updateStep(sequence.id, step, visiblePageRef.current, {
        [stepPropertyCurrentlyBeingEdited]:
          value * (MAX_STEP_VALUES[stepPropertyCurrentlyBeingEdited] ?? 1),
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
            onClick={() => updateChannelConfig(sequence.id, channelIndex, { isMuted: true })}
          />
        )}
        {channelConfig.isMuted && (
          <Icon
            icon="volume-off"
            onClick={() => updateChannelConfig(sequence.id, channelIndex, { isMuted: false })}
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
        'sequencer-channel--is-highlighted': channelConfig.isHighlighted,
        'sequencer-channel--has-config-open': isConfigOpen,
      })}
    >
      <div className="sequencer-channel__inner">
        <div className="sequencer-channel__name" onMouseDown={() => triggerCallback(channelIndex)}>
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
                  ? (step?.[stepPropertyCurrentlyBeingEdited] ??
                      DEFAULT_STEP_VALUES[stepPropertyCurrentlyBeingEdited] ??
                      1) / (MAX_STEP_VALUES[stepPropertyCurrentlyBeingEdited] ?? 1)
                  : undefined
              }
              fillPercentageMax={
                stepPropertyCurrentlyBeingEdited === 'duration'
                  ? sequence.nSteps - stepIndex
                  : undefined
              }
              onFillPercentageChange={
                stepPropertyCurrentlyBeingEdited ? onFillPercentageChangeHandler : undefined
              }
              stepPropertyEditDirection={stepPropertyEditDirection}
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
