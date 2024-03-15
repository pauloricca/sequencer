import React, { useEffect, useRef, useState } from 'react';
import { Sequencer, SequencerProps } from 'components/Sequencer/Sequencer';
import { SynthProps } from './Synth.types';
import { sendMidiMessage } from 'utils/midi';
import { Midi, Scale, ScaleType } from 'tonal';
import { useSequencersState } from 'state/state';
import { StateSequenceChannelConfigMidi, StateSequenceStep } from 'state/state.types';
import { getIntervalFromClockSpeed } from 'components/Controller/Controller.utils';
import { InstrumentConfigSelectKnob } from 'components/InstrumentConfig/InstrumentConfigSelectKnob/InstrumentConfigSelectKnob';
import { InstrumentConfigSelectKnobItem } from 'components/InstrumentConfig/InstrumentConfigSelectKnob/InstrumentConfigSelectKnob.types';

export const Synth: React.FC<SynthProps> = ({ sequence, ...sequencerProps }) => {
  const clockSpeed = useSequencersState(({ clockSpeed }) => clockSpeed);
  const updateSequence = useSequencersState((state) => state.updateSequence);
  const [synthChannels, setSynthChannels] = useState<StateSequenceChannelConfigMidi[]>([]);
  const rootOptions = useRef<InstrumentConfigSelectKnobItem[]>(
    [...Array(101).keys()].map((note) => ({
      value: note,
      key: note,
      label: Midi.midiToNoteName(note),
    }))
  );
  const scaleOptions = useRef<InstrumentConfigSelectKnobItem[]>(
    ScaleType.all().map((scale) => ({
      value: scale.name,
      key: scale.name,
      label: scale.name,
    }))
  );
  const polyphonyOptions = useRef<InstrumentConfigSelectKnobItem[]>([
    {
      value: false,
      label: 'monophonic',
    },
    {
      value: true,
      label: 'polyphonic',
    },
  ]);

  useEffect(() => {
    // Get indexes of the scale per channel e.g. [-3, -2, -1, 0, 1, 2, 3]
    const scaleIndexes = [...Array(Math.floor(sequence.range)).keys()].map(
      (i) => Math.floor(sequence.range / 2) - i
    );

    const stepMap = Midi.pcsetSteps(
      Scale.get(`${Midi.midiToNoteName(sequence.rootNote)} ${sequence.scale}`).chroma,
      sequence.rootNote
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
  }, [sequence.rootNote, sequence.range, sequence.scale]);

  const triggerNote = (channelIndex: number, step?: StateSequenceStep) => {
    const channel = synthChannels[channelIndex];

    if (!channel || !sequence.midiOutDeviceName) return;

    sendMidiMessage(sequence.midiOutDeviceName, {
      note: synthChannels[channelIndex].midiNote,
      velocity: 127 * (step?.volume ?? 1),
      channel: sequence.midiChannel,
      duration: sequence.noteDuration * getIntervalFromClockSpeed(clockSpeed) * sequence.stepLength,
      isMonophonic: !sequence.isPolyphonic,
    });
  };

  const instrumentConfigCallback: SequencerProps['instrumentConfigCallback'] = () => (
    <>
      <InstrumentConfigSelectKnob
        label={`midi channel: ${sequence.midiChannel}`}
        type="numeric"
        min={0}
        max={32}
        onChange={(value) => updateSequence(sequence.name)({ midiChannel: value })}
        value={sequence.midiChannel}
      />
      <InstrumentConfigSelectKnob
        label={`range: ${sequence.range}`}
        type="numeric"
        min={1}
        max={32}
        actionMessage={{
          type: 'Sequence Param Change',
          sequenceName: sequence.name,
          param: 'range',
        }}
        value={sequence.range}
      />
      <InstrumentConfigSelectKnob
        label={`root: ${Midi.midiToNoteName(sequence.rootNote)}`}
        type="discrete"
        items={rootOptions.current}
        actionMessage={{
          type: 'Sequence Param Change',
          sequenceName: sequence.name,
          param: 'rootNote',
        }}
        value={sequence.rootNote}
      />
      <InstrumentConfigSelectKnob
        label={`note duration: ${sequence.noteDuration}`}
        type="numeric"
        min={0}
        max={sequence.nSteps}
        step={0.1}
        speed={5}
        actionMessage={{
          type: 'Sequence Param Change',
          sequenceName: sequence.name,
          param: 'noteDuration',
        }}
        value={sequence.noteDuration}
        showDial
      />
      <InstrumentConfigSelectKnob
        label={`scale: ${sequence.scale}`}
        type="discrete"
        items={scaleOptions.current}
        actionMessage={{
          type: 'Sequence Param Change',
          sequenceName: sequence.name,
          param: 'scale',
        }}
        value={sequence.scale}
      />
      <InstrumentConfigSelectKnob
        label={sequence.isPolyphonic ? 'polyphonic' : 'monophonic'}
        type="discrete"
        items={polyphonyOptions.current}
        onChange={(value) => updateSequence(sequence.name)({ isPolyphonic: value })}
        value={sequence.isPolyphonic}
        clickOnModalButtonClosesModal
      />
    </>
  );

  return (
    <div className="synth">
      <Sequencer
        {...sequencerProps}
        sequence={sequence}
        channelsConfig={synthChannels}
        triggerCallback={triggerNote}
        instrumentConfigCallback={instrumentConfigCallback}
      />
    </div>
  );
};
