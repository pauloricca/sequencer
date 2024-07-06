import React, { ReactNode, memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  SequencerChannelStep,
  SequencerChannelStepProps,
} from './SequencerChannelStep/SequencerChannelStep';
import { StateSequenceStep, StateSequenceStepProperties } from 'state/state.types';
import { useSequencersState } from 'state/state';
import { Icon } from '@blueprintjs/core';
import classNames from 'classnames';
import {
  DEFAULT_STEP_VALUES,
  MAX_STEP_VALUES,
} from 'components/Sequencer/SequencerChannel/SequencerChannel.constants';
import { getCurrentPattern } from 'state/state.utils';
import { isEqual } from 'lodash';
require('./_SequencerChannel.scss');

export interface SequencerChannelProps
  extends Pick<SequencerChannelStepProps, 'stepPropertyEditDirection'> {
  sequenceId: string;
  channelIndex: number;
  activeStepIndex: number;
  visiblePage: number;
  triggerCallback?: (channel: number, step?: StateSequenceStep) => void;
  showChannelControls?: boolean;
  channelConfigComponents?: (channelIndex: number) => ReactNode;
  stepPropertyCurrentlyBeingEdited: keyof StateSequenceStepProperties | null;
}

export const SequencerChannel: React.FC<SequencerChannelProps> = memo(
  ({
    sequenceId,
    channelIndex,
    activeStepIndex,
    visiblePage,
    triggerCallback = () => {},
    showChannelControls = false,
    channelConfigComponents,
    stepPropertyCurrentlyBeingEdited,
    stepPropertyEditDirection,
  }) => {
    const nSteps = useSequencersState(
      (state) => state.sequences.find(({ id }) => sequenceId === id)?.nSteps ?? 1
    );
    const stepsInPage = useSequencersState((state) => {
      const sequence = state.sequences.find(({ id }) => sequenceId === id);

      if (!sequence) return [];

      return getCurrentPattern(sequence).pages[visiblePage].steps;
    });
    const isSequenceMuted = useSequencersState(
      (state) => state.sequences.find(({ id }) => sequenceId === id)?.isMuted
    );
    const setStep = useSequencersState((state) => state.setStep);
    const removeStep = useSequencersState((state) => state.removeStep);
    const updateChannelConfig = useSequencersState((state) => state.updateChannelConfig);
    const updateStep = useSequencersState((state) => state.updateStep);
    const [isDraggingAlongChannel, setIsDraggingAlongChannel] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // To use inside the callback
    const visiblePageRef = useRef(visiblePage);

    // Get offset of channel properties so that others don't trigger refresh
    const { isMuted, isHidden, isHighlighted, name } = useSequencersState((state) => {
      const sequence = state.sequences.find(({ id }) => id === sequenceId)!;
      const channelConfig = sequence.channelsConfig[channelIndex];

      return {
        isMuted: channelConfig.isMuted,
        isHidden: channelConfig.isHidden,
        isHighlighted: channelConfig.isHighlighted,
        name: channelConfig.name,
      };
    }, isEqual);

    visiblePageRef.current = visiblePage;

    const channelStepsByIndex = [...Array(nSteps).keys()].map((stepIndex) =>
      stepsInPage.find((step) => step.stepIndex === stepIndex && step.channel === channelIndex)
    );

    const onStepToggleHandler = useCallback(
      (stepIndex: number, currentStep?: StateSequenceStep) => {
        if (currentStep) {
          removeStep(sequenceId, currentStep, visiblePageRef.current);
        } else {
          setStep(
            sequenceId,
            {
              channel: channelIndex,
              stepIndex,
            },
            visiblePageRef.current
          );
        }
      },
      []
    );

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
        updateStep(sequenceId, step, visiblePageRef.current, {
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
          {!isMuted && (
            <Icon
              icon="volume-up"
              onClick={() => updateChannelConfig(sequenceId, channelIndex, { isMuted: true })}
            />
          )}
          {isMuted && (
            <Icon
              icon="volume-off"
              onClick={() => updateChannelConfig(sequenceId, channelIndex, { isMuted: false })}
            />
          )}
        </div>
      ),
      [isConfigOpen, isMuted]
    );

    if (isHidden) return null;

    return (
      <div
        className={classNames('sequencer-channel', {
          'sequencer-channel--is-muted': isMuted || isSequenceMuted,
          'sequencer-channel--is-highlighted': isHighlighted,
          'sequencer-channel--has-config-open': isConfigOpen,
        })}
      >
        <div className="sequencer-channel__inner">
          <div
            className="sequencer-channel__name"
            onMouseDown={() => triggerCallback(channelIndex)}
          >
            {name}
          </div>
          {showChannelControls && channelControls}
          <div className="sequencer-channel__steps">
            {channelStepsByIndex.map((step, stepIndex) => (
              <SequencerChannelStep
                key={stepIndex}
                stepIndex={stepIndex}
                step={step}
                isActive={activeStepIndex === stepIndex && !isMuted}
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
                  stepPropertyCurrentlyBeingEdited === 'duration' ? nSteps - stepIndex : undefined
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
  }
);

SequencerChannel.displayName = 'SequencerChannel';
