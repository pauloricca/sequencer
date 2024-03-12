import React, { useEffect, useRef, useState } from 'react';
import { Sequencer, SequencerProps } from 'components/Sequencer/Sequencer';
import { SynthProps } from './Synth.types';
import { sendMidiMessage } from 'utils/midi';
import { Midi, Scale, ScaleType } from 'tonal';
import { useSequencersState } from 'state/state';
import { InstrumentConfigSelectItem } from 'components/InstrumentConfig/InstrumentConfigSelect/InstrumentConfigSelect.types';
import { InstrumentConfigKnob } from 'components/InstrumentConfig/InstrumentConfigKnob/InstrumentConfigKnob';
import { StateSequenceChannelConfigMidi, StateSequenceStep } from 'state/state.types';
import { getIntervalFromClockSpeed } from 'components/Controller/Controller.utils';
import { InstrumentConfigSelectKnob } from 'components/InstrumentConfig/InstrumentConfigSelectKnob/InstrumentConfigSelectKnob';
import { InstrumentConfigSelectKnobItem } from 'components/InstrumentConfig/InstrumentConfigSelectKnob/InstrumentConfigSelectKnob.types';

export const Synth: React.FC<SynthProps> = ({ sequence, ...sequencerProps }) => {
  const clockSpeed = useSequencersState(({ clockSpeed }) => clockSpeed);
  const updateSequence = useSequencersState((state) => state.updateSequence(sequence.name));
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
  const polyphonyOptions = useRef<InstrumentConfigSelectItem[]>([
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
    const scaleIndexes = [...Array(sequence.range).keys()].map(
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
      <InstrumentConfigKnob
        label={`midi channel: ${sequence.midiChannel}`}
        value={sequence.midiChannel}
        min={0}
        max={32}
        isIntegerOnly={true}
        onChange={(value) => updateSequence({ midiChannel: value })}
      />
      <InstrumentConfigKnob
        label={`range: ${sequence.range}`}
        value={sequence.range}
        min={1}
        max={32}
        isIntegerOnly={true}
        onChange={(value) => updateSequence({ range: value })}
      />
      <InstrumentConfigSelectKnob
        label={`range: ${sequence.range}`}
        type="numeric"
        min={1}
        max={32}
        // onChange={(value) => updateSequence({ range: value })}
        onChange={() => {}}
        value={sequence.range}
      />
      <InstrumentConfigSelectKnob
        label={`root: ${Midi.midiToNoteName(sequence.rootNote)}`}
        type="discrete"
        items={rootOptions.current}
        onChange={(value) => updateSequence({ rootNote: value })}
        value={sequence.rootNote}
      />
      <InstrumentConfigKnob
        label={`note duration: ${Math.round(sequence.noteDuration * 100) / 100}`}
        value={sequence.noteDuration}
        min={0}
        max={sequence.nSteps}
        isIntegerOnly={false}
        onChange={(value) => updateSequence({ noteDuration: Math.round(value * 100) / 100 })}
      />
      <InstrumentConfigSelectKnob
        label={`scale: ${sequence.scale}`}
        type="discrete"
        items={scaleOptions.current}
        onChange={(value) => updateSequence({ scale: value })}
        value={sequence.scale}
      />
      <InstrumentConfigSelectKnob
        label={sequence.isPolyphonic ? 'polyphonic' : 'monophonic'}
        type="discrete"
        items={polyphonyOptions.current}
        onChange={(value) => updateSequence({ isPolyphonic: value })}
        value={sequence.isPolyphonic}
        clickOnModalButtonClosesModal
        speed="fast"
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
