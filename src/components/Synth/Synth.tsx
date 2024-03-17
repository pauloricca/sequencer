import React, { useCallback, useEffect, useState } from 'react';
import { Sequencer, SequencerProps } from 'components/Sequencer/Sequencer';
import { sendMidiMessage } from 'utils/midi';
import { Midi, Scale } from 'tonal';
import { useSequencersState } from 'state/state';
import {
  StateSequenceChannelConfigMidi,
  StateSequenceStep,
  StateSequenceSynth,
} from 'state/state.types';
import { getIntervalFromClockSpeed } from 'components/Controller/Controller.utils';
import { isEqual } from 'lodash';
import { getSynthConfigParameterConfig } from './Synth.config';
import { ControllerParameter } from 'components/Controller/ControllerParameter/ControllerParameter';

interface SynthProps {
  sequenceName: string;
}

export const Synth: React.FC<SynthProps> = ({ sequenceName }) => {
  const { rootNote, range, scale } = useSequencersState((state) => {
    const sequence = state.sequences.find(
      ({ name }) => name === sequenceName
    ) as StateSequenceSynth;

    return {
      rootNote: sequence.rootNote,
      range: sequence.range,
      scale: sequence.scale,
    };
  }, isEqual);
  const [synthChannels, setSynthChannels] = useState<StateSequenceChannelConfigMidi[]>([]);

  useEffect(() => {
    // Get indexes of the scale per channel e.g. [-3, -2, -1, 0, 1, 2, 3]
    const scaleIndexes = [...Array(Math.floor(range)).keys()].map((i) => Math.floor(range / 2) - i);

    const stepMap = Midi.pcsetSteps(
      Scale.get(`${Midi.midiToNoteName(rootNote)} ${scale}`).chroma,
      rootNote
    );
    const channelNotes = scaleIndexes.map(stepMap).filter((note) => note >= 0);

    setSynthChannels(
      channelNotes.map(
        (note) =>
          ({
            type: 'midi',
            name: Midi.midiToNoteName(note),
            midiNote: note,
          }) as StateSequenceChannelConfigMidi
      )
    );
  }, [rootNote, range, scale]);

  const triggerNote = useCallback(
    (channelIndex: number, step?: StateSequenceStep) => {
      const sequence = useSequencersState
        .getState()
        .sequences.find(({ name }) => name === sequenceName) as StateSequenceSynth;
      const channel = synthChannels[channelIndex];
      const clockSpeed = useSequencersState.getState().clockSpeed;

      if (!channel || !sequence.midiOutDeviceName) return;

      sendMidiMessage(sequence.midiOutDeviceName, {
        note: synthChannels[channelIndex].midiNote,
        velocity: 127 * (step?.volume ?? 1),
        channel: sequence.midiChannel,
        duration:
          sequence.noteDuration * getIntervalFromClockSpeed(clockSpeed) * sequence.stepLength,
        isMonophonic: !sequence.isPolyphonic,
      });
    },
    [sequenceName, synthChannels]
  );

  const sequencerConfigCallback: SequencerProps['sequencerConfigCallback'] = () =>
    getSynthConfigParameterConfig(sequenceName).map((parameterConfig) => (
      <ControllerParameter key={parameterConfig.actionMessage.parameter} {...parameterConfig} />
    ));

  return (
    <div className="synth">
      <Sequencer
        sequenceName={sequenceName}
        channelsConfig={synthChannels}
        triggerCallback={triggerNote}
        sequencerConfigCallback={sequencerConfigCallback}
      />
    </div>
  );
};
