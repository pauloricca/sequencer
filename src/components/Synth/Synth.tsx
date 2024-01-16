import React, { useEffect, useRef, useState } from "react";
import { Sequencer } from "../Sequencer/Sequencer";
import { SynthChannelConfig, SynthChannelConfigMidi, SynthProps } from "./Synth.types";
import { sendMidiMessage } from "../../utils/midi";
import { StateSequenceSynth } from "src/state/state.types";
import { InstrumentConfig } from "../InstrumentConfig/InstrumentConfig";
import { InstrumentConfigSelect } from "../InstrumentConfig/InstrumentConfigSelect/InstrumentConfigSelect";
import { Midi, Scale, ScaleType } from "tonal";
import { useSequencersState } from "../../state/state";
import { InstrumentConfigSelectItem } from "../InstrumentConfig/InstrumentConfigSelect/InstrumentConfigSelect.types";

export const Synth: React.FC<SynthProps> = ({
  ...sequencerProps
}) => {
  const synthSequenceAttributes = (sequencerProps.sequence as StateSequenceSynth);
  const updateSequence = useSequencersState((state) =>
    state.updateSequence(sequencerProps.sequence.name)
  );
  const [synthChannels, setSynthChannels] = useState<SynthChannelConfig[]>([]);
  const rootNoteOptions = useRef<InstrumentConfigSelectItem[]>(
    [...Array(101).keys()].map((key) => ({
      key,
      label: Midi.midiToNoteName(key),
      value: key,
    }))
  );
  const scaleOptions = useRef<InstrumentConfigSelectItem[]>(
    ScaleType.all().map((scale) => ({
      key: scale.name,
      value: scale,
      label: scale.name,
    }))
  );
  const rangeOptions = useRef<InstrumentConfigSelectItem[]>(
    [...Array(31).keys()].map((key) => ({
      key: key + 1,
      label: `${key + 1}`,
      value: key + 1,
    }))
  );

  useEffect(() => {
    // Get indexes of the scale per channel e.g. [-3, -2, -1, 0, 1, 2, 3]
    const scaleIndexes = [...Array(synthSequenceAttributes.range).keys()].map(
      (i) => i - Math.floor(synthSequenceAttributes.range / 2)
    );

    const stepMap = Midi.pcsetSteps(
      Scale.get(
        `${Midi.midiToNoteName(synthSequenceAttributes.rootNote)} ${
          synthSequenceAttributes.scale
        }`
      ).chroma,
      synthSequenceAttributes.rootNote
    );
    const channelNotes = scaleIndexes.map(stepMap).filter((note) => note >= 0);

    setSynthChannels(
      channelNotes.map((note) => ({
        type: "midi",
        name: Midi.midiToNoteName(note),
        note: note,
      }))
    );
  }, [
    synthSequenceAttributes.rootNote,
    synthSequenceAttributes.range,
    synthSequenceAttributes.scale,
  ]);

  const triggerSample = (channelIndex: number) => {
    const channel = synthChannels[channelIndex];

    if (!channel || !sequencerProps.sequence.midiOutDeviceName) return;

    sendMidiMessage(sequencerProps.sequence.midiOutDeviceName, {
      note: (synthChannels[channelIndex] as SynthChannelConfigMidi).note,
      velocity: 127,
      channel: 1,
    });
  };

  return (
    <div className="synth instrument">
      <InstrumentConfig sequence={sequencerProps.sequence}>
        <InstrumentConfigSelect
          label={`range: ${synthSequenceAttributes.range}`}
          items={rangeOptions.current}
          onSelect={({ value }) => updateSequence({ range: value })}
        />
        <InstrumentConfigSelect
          label={`root: ${Midi.midiToNoteName(synthSequenceAttributes.rootNote)}`}
          items={rootNoteOptions.current}
          onSelect={({ value }) => updateSequence({ rootNote: value })}
        />
        <InstrumentConfigSelect
          label={`scale: ${synthSequenceAttributes.scale}`}
          items={scaleOptions.current}
          onSelect={({ label }) => updateSequence({ scale: label })}
        />
      </InstrumentConfig>
      <Sequencer
        {...sequencerProps}
        channelsConfig={synthChannels}
        triggerCallback={triggerSample}
      />
    </div>
  );
};
