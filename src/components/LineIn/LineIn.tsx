import React, { useCallback, useEffect, useRef } from 'react';
import { Sequencer } from 'components/Sequencer/Sequencer';
import { useSequencersState } from 'state/state';
import {
  StateSequenceChannelConfigLineIn,
  StateSequenceLineIn,
  StateSequenceStep,
} from 'state/state.types';
import { isEqual } from 'lodash';
import { ControllerParameter } from 'components/Controller/ControllerParameter/ControllerParameter';
import { getIntervalFromClockSpeed } from 'state/state.utils';
import { SequencerProps } from 'components/Sequencer/Sequencer.types';
import { getLineInConfigParameterConfig } from './LineIn.config';
import * as Tone from 'tone';

interface LineInProps {
  sequenceId: string;
}

export const LineIn: React.FC<LineInProps> = ({ sequenceId }) => {
  const { sequenceName, isMuted } = useSequencersState((state) => {
    const sequence = state.sequences.find(({ id }) => id === sequenceId) as StateSequenceLineIn;

    return {
      sequenceName: sequence.name,
      isMuted: sequence.isMuted,
    };
  }, isEqual);
  const setChannelConfig = useSequencersState((state) => state.setChannelConfig);
  const channelConfig = useSequencersState(
    (state) =>
      (state.sequences.find(({ id }) => id === sequenceId) as StateSequenceLineIn).channelsConfig
  );
  const isPlaying = useSequencersState((state) => state.isPlaying);
  const lineIn = useRef(new Tone.UserMedia());
  const envelope = useRef(new Tone.AmplitudeEnvelope());

  useEffect(() => {
    setChannelConfig(sequenceId, [
      {
        type: 'line-in',
        name: 'line in',
      } as StateSequenceChannelConfigLineIn,
    ]);

    lineIn.current.open();
    lineIn.current.chain(envelope.current, Tone.Destination);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      envelope.current.triggerRelease(0);
    } else {
      envelope.current.triggerAttack();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isMuted) {
      envelope.current.triggerRelease();
    }
  }, [isMuted]);

  const triggerCallback = useCallback(
    (channelIndex: number, step?: StateSequenceStep) => {
      if (!step) return;

      const sequence = useSequencersState
        .getState()
        .sequences.find(({ id }) => id === sequenceId) as StateSequenceLineIn;

      const clockSpeed = useSequencersState.getState().clockSpeed;

      envelope.current.attack = sequence.attack ?? 0;
      envelope.current.decay = sequence.decay ?? 0;
      envelope.current.sustain = sequence.sustain ?? 1;
      envelope.current.release = sequence.release ?? 0;

      const durationMillis =
        (step.duration || 1) *
        getIntervalFromClockSpeed(clockSpeed) *
        sequence.stepLength *
        (sequence.gate ?? 1);

      envelope.current.triggerAttackRelease(durationMillis / 1000, undefined, step.volume ?? 1);
    },
    [channelConfig]
  );

  const sequencerConfigCallback: SequencerProps['sequencerConfigCallback'] = () =>
    getLineInConfigParameterConfig(sequenceName).map((parameterConfig) => (
      <ControllerParameter key={parameterConfig.actionMessage.parameter} {...parameterConfig} />
    ));

  return (
    <div className="line-in">
      <Sequencer
        sequenceId={sequenceId}
        triggerCallback={triggerCallback}
        sequencerConfigCallback={sequencerConfigCallback}
      />
    </div>
  );
};
