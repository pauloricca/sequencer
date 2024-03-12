import React, { useRef } from 'react';
import { SequencerChannel, SequencerChannelProps } from '../SequencerChannel/SequencerChannel';
import {
  StateSequence,
  StateSequenceChannelConfigCommon,
  StateSequenceStepProperties,
} from 'state/state.types';
import { useMetronome } from 'utils/metronome';
require('./_SequencerGrid.scss');

export interface SequencerGridProps
  extends Pick<
    SequencerChannelProps,
    'triggerCallback' | 'showChannelControls' | 'channelConfigComponents'
  > {
  sequence: StateSequence;
  channelsConfig: StateSequenceChannelConfigCommon[];
  visiblePage: number;
  stepPropertyCurrentlyBeingEdited: keyof StateSequenceStepProperties | null;
  activePageIndex: number;
  setActivePageIndex: (activePageIndex: number) => void;
}

export const SequencerGrid: React.FC<SequencerGridProps> = ({
  sequence,
  channelsConfig,
  triggerCallback = () => {},
  visiblePage,
  stepPropertyCurrentlyBeingEdited,
  activePageIndex,
  setActivePageIndex,
  ...otherSequencerChannelProps
}) => {
  const tick = useMetronome(sequence.stepLength);
  const lastTick = useRef(-1);
  const activeStepIndex = useRef(-1);

  if (tick !== lastTick.current) {
    lastTick.current = tick;

    activeStepIndex.current = tick <= 0 ? tick : (activeStepIndex.current + 1) % sequence.nSteps;

    if (tick <= 0) {
      activeStepIndex.current = tick;
    } else if (activeStepIndex.current === 0) {
      setActivePageIndex(
        (activePageIndex + 1) % sequence.patterns[sequence.currentPattern].pages.length
      );
    }

    // Trigger steps
    const stepsToTrigger = sequence.patterns[sequence.currentPattern].pages[
      activePageIndex
    ].steps.filter(({ stepIndex }) => stepIndex === activeStepIndex.current);

    stepsToTrigger.forEach((step) => {
      if (!sequence.isMuted && !channelsConfig[step.channel]?.isMuted) {
        if (
          step.probability === undefined ||
          step.probability === 1 ||
          Math.random() < step.probability
        ) {
          triggerCallback(step.channel, step);
        }
      }
    });
  }

  return (
    <div className="sequencer-grid">
      {channelsConfig
        .filter(({ isHidden }) => !isHidden)
        .map((channelConfig, channelIndex) => (
          <SequencerChannel
            channelIndex={channelIndex}
            channelConfig={channelConfig}
            sequence={sequence}
            key={channelIndex}
            activeStepIndex={visiblePage === activePageIndex ? activeStepIndex.current : -1}
            visiblePage={visiblePage}
            triggerCallback={triggerCallback}
            stepPropertyCurrentlyBeingEdited={stepPropertyCurrentlyBeingEdited}
            {...otherSequencerChannelProps}
          />
        ))}
    </div>
  );
};
