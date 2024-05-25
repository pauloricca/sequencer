import React, { useRef } from 'react';
import { SequencerChannel, SequencerChannelProps } from '../SequencerChannel/SequencerChannel';
import { StateSequenceChannelConfigCommon, StateSequenceStepProperties } from 'state/state.types';
import { useMetronome } from 'utils/metronome';
import { useSequencersState } from 'state/state';
import { sample, shuffle, uniq } from 'lodash';
import { DEFAULT_STEP_VALUES } from '../SequencerChannel/SequencerChannel.constants';
import { getCurrentPattern } from 'state/state.utils';
require('./_SequencerGrid.scss');

export interface SequencerGridProps
  extends Pick<
    SequencerChannelProps,
    | 'triggerCallback'
    | 'showChannelControls'
    | 'channelConfigComponents'
    | 'stepPropertyCurrentlyBeingEdited'
    | 'stepPropertyEditDirection'
  > {
  sequenceId: string;
  channelsConfig: StateSequenceChannelConfigCommon[];
  visiblePage: number;
  stepPropertyCurrentlyBeingEdited: keyof StateSequenceStepProperties | null;
  activePageIndex: number;
  setActivePageIndex: (activePageIndex: number) => void;
}

export const SequencerGrid: React.FC<SequencerGridProps> = ({
  sequenceId,
  channelsConfig,
  triggerCallback = () => {},
  visiblePage,
  stepPropertyCurrentlyBeingEdited,
  activePageIndex,
  setActivePageIndex,
  ...otherSequencerChannelProps
}) => {
  const sequence = useSequencersState((state) =>
    state.sequences.find(({ id }) => id === sequenceId)
  );
  const updateStep = useSequencersState((state) => state.updateStep);
  const tick = useMetronome(sequence?.stepLength ?? 1);
  const lastTick = useRef(-1);
  const activeStepIndex = useRef(-1);

  if (!sequence) return null;

  if (tick !== lastTick.current) {
    lastTick.current = tick;

    activeStepIndex.current = tick <= 0 ? tick : (activeStepIndex.current + 1) % sequence.nSteps;

    if (tick <= 0) {
      activeStepIndex.current = tick;
    } else if (activeStepIndex.current === 0) {
      const nextPage = (activePageIndex + 1) % getCurrentPattern(sequence).pages.length;

      setActivePageIndex(nextPage);

      // Restarting the pattern and need to mutate it?
      if (nextPage === 0 && (sequence.mutationAmount || 0) > 0) {
        getCurrentPattern(sequence).pages.forEach((page, pageNumber) => {
          if (!sequence.mutationAmount) return;

          const mutableSteps = shuffle(
            page.steps.filter(
              ({ mutability, channel }) =>
                (mutability ?? DEFAULT_STEP_VALUES.mutability ?? 0) > 0 &&
                !channelsConfig[channel].isMuted
            )
          );

          const stepsToMutate = mutableSteps.slice(
            0,
            Math.max(1, Math.floor(mutableSteps.length * sequence.mutationAmount))
          );

          // Drum machine steps mutate horizontally, and synth steps vertically (change note)
          if (sequence.type === 'drum-machine') {
            const channelsToMutate = uniq(stepsToMutate.map(({ channel }) => channel));

            channelsToMutate.forEach((channel) => {
              const existingStepIndexesInChannel = page.steps
                .filter((step) => step.channel === channel)
                .map(({ stepIndex }) => stepIndex);

              let emptyStepIndexesInChannel = [...Array(sequence.nSteps).keys()].filter(
                (stepIndex) => !existingStepIndexesInChannel.includes(stepIndex)
              );

              if (!emptyStepIndexesInChannel.length) return;

              stepsToMutate
                .filter((step) => step.channel === channel)
                .forEach((step) => {
                  const newStepIndex = sample(emptyStepIndexesInChannel) as number;

                  updateStep(sequenceId, step, pageNumber, {
                    stepIndex: newStepIndex,
                  });

                  // Update empty steps by removing the one we moved into and adding the one we moved from
                  emptyStepIndexesInChannel = [
                    step.stepIndex,
                    ...emptyStepIndexesInChannel.filter((stepIndex) => stepIndex !== newStepIndex),
                  ];
                });
            });
          } else if (sequence.type === 'synth') {
            const stepIndexesToMutate = uniq(stepsToMutate.map(({ stepIndex }) => stepIndex));

            stepIndexesToMutate.forEach((stepIndex) => {
              const existingChannelsInStepIndex = page.steps
                .filter((step) => step.stepIndex === stepIndex)
                .map(({ channel }) => channel);

              let emptyChannelInStepIndex = [...Array(channelsConfig.length).keys()].filter(
                (channel) => !existingChannelsInStepIndex.includes(channel)
              );

              if (!emptyChannelInStepIndex.length) return;

              stepsToMutate
                .filter((step) => step.stepIndex === stepIndex)
                .forEach((step) => {
                  const newChannel = sample(emptyChannelInStepIndex) as number;

                  updateStep(sequenceId, step, pageNumber, {
                    channel: newChannel,
                  });

                  // Update empty steps by removing the one we moved into and adding the one we moved from
                  emptyChannelInStepIndex = [
                    step.channel,
                    ...emptyChannelInStepIndex.filter((channel) => channel !== newChannel),
                  ];
                });
            });
          }
        });
      }
    }

    // Trigger steps
    const stepsToTrigger = getCurrentPattern(sequence).pages[activePageIndex].steps.filter(
      ({ stepIndex }) => stepIndex === activeStepIndex.current
    );

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
