import React, { useCallback, useEffect, useState } from 'react';
import { Sequencer } from 'components/Sequencer/Sequencer';
import { sendMidiMessage } from 'utils/midi';
import { Midi, Scale } from 'tonal';
import { useSequencersState } from 'state/state';
import {
  StateSequenceChannelConfigMidiNote,
  StateSequenceStep,
  StateSequenceSynth,
} from 'state/state.types';
import { isEqual } from 'lodash';
import { getSynthConfigParameterConfig } from './Synth.config';
import { ControllerParameter } from 'components/Controller/ControllerParameter/ControllerParameter';
import { getIntervalFromClockSpeed } from 'state/state.utils';
import { SequencerProps } from 'components/Sequencer/Sequencer.types';

interface SynthProps {
  sequenceId: string;
}

export const Synth: React.FC<SynthProps> = ({ sequenceId }) => {
  const { rootNote, transpose, range, scale, sequenceName } = useSequencersState((state) => {
    const sequence = state.sequences.find(({ id }) => id === sequenceId) as StateSequenceSynth;

    return {
      rootNote: sequence.rootNote,
      range: sequence.range,
      scale: sequence.scale,
      transpose: sequence.transpose,
      sequenceName: sequence.name,
    };
  }, isEqual);
  const [synthChannels, setSynthChannels] = useState<StateSequenceChannelConfigMidiNote[]>([]);

  useEffect(() => {
    // Get indexes of the scale per channel e.g. [-3, -2, -1, 0, 1, 2, 3]
    const scaleIndexes = [...Array(Math.floor(range)).keys()].map((i) => Math.floor(range / 2) - i);

    const stepMap = Midi.pcsetSteps(
      Scale.get(`${Midi.midiToNoteName(rootNote + transpose)} ${scale}`).chroma,
      rootNote + transpose
    );
    const channelNotes = scaleIndexes.map(stepMap).filter((note) => note >= 0);

    setSynthChannels(
      channelNotes.map(
        (note) =>
          ({
            type: 'midi',
            name: Midi.midiToNoteName(note),
            midiNote: note,
            isHighlighted: (note - rootNote) % 12 === 0,
          }) as StateSequenceChannelConfigMidiNote
      )
    );
  }, [rootNote, range, scale, transpose]);

  const triggerNote = useCallback(
    (channelIndex: number, step?: StateSequenceStep) => {
      const sequence = useSequencersState
        .getState()
        .sequences.find(({ id }) => id === sequenceId) as StateSequenceSynth;
      const channel = synthChannels[channelIndex];
      const clockSpeed = useSequencersState.getState().clockSpeed;

      if (!channel || !sequence.midiOutDeviceName) return;

      sendMidiMessage(sequence.midiOutDeviceName, {
        note: synthChannels[channelIndex].midiNote,
        velocity: 127 * (step?.volume ?? 1),
        channel: sequence.midiChannel,
        duration:
          (step?.duration ?? sequence.noteDuration) *
          getIntervalFromClockSpeed(clockSpeed) *
          sequence.stepLength,
        isMonophonic: !sequence.isPolyphonic,
      });
    },
    [synthChannels]
  );

  const sequencerConfigCallback: SequencerProps['sequencerConfigCallback'] = () =>
    getSynthConfigParameterConfig(sequenceName).map((parameterConfig) => (
      <ControllerParameter key={parameterConfig.actionMessage.parameter} {...parameterConfig} />
    ));

  return (
    <div className="synth">
      <Sequencer
        sequenceId={sequenceId}
        channelsConfig={synthChannels}
        triggerCallback={triggerNote}
        sequencerConfigCallback={sequencerConfigCallback}
      />
    </div>
  );
};
