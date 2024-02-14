import React, { useEffect, useRef, useState } from "react";
import { Sequencer, SequencerProps } from "../Sequencer/Sequencer";
import { SynthProps } from "./Synth.types";
import { sendMidiMessage } from "../../utils/midi";
import { InstrumentConfigSelect } from "../InstrumentConfig/InstrumentConfigSelect/InstrumentConfigSelect";
import { Midi, Scale, ScaleType } from "tonal";
import { useSequencersState } from "../../state/state";
import { InstrumentConfigSelectItem } from "../InstrumentConfig/InstrumentConfigSelect/InstrumentConfigSelect.types";
import { InstrumentConfigKnob } from "../InstrumentConfig/InstrumentConfigKnob/InstrumentConfigKnob";
import { StateSequenceChannelConfigMidi, StateSequenceStep } from "../../state/state.types";
import { getIntervalFromClockSpeed } from "../Controller/Controller.utils";

export const Synth: React.FC<SynthProps> = ({
  sequence,
  ...sequencerProps
}) => {
  const clockSpeed = useSequencersState(({ clockSpeed }) => clockSpeed);
  const updateSequence = useSequencersState((state) =>
    state.updateSequence(sequence.name)
  );
  const [synthChannels, setSynthChannels] = useState<
    StateSequenceChannelConfigMidi[]
  >([]);
  const scaleOptions = useRef<InstrumentConfigSelectItem[]>(
    ScaleType.all().map((scale) => ({
      value: scale,
      label: scale.name,
    }))
  );

  useEffect(() => {
    // Get indexes of the scale per channel e.g. [-3, -2, -1, 0, 1, 2, 3]
    const scaleIndexes = [...Array(sequence.range).keys()].map(
      (i) => Math.floor(sequence.range / 2) - i
    );

    const stepMap = Midi.pcsetSteps(
      Scale.get(`${Midi.midiToNoteName(sequence.rootNote)} ${sequence.scale}`)
        .chroma,
      sequence.rootNote
    );
    const channelNotes = scaleIndexes.map(stepMap).filter((note) => note >= 0);

    setSynthChannels(
      channelNotes.map(
        (note) =>
          ({
            type: "midi",
            name: Midi.midiToNoteName(note),
            midiNote: note,
          } as StateSequenceChannelConfigMidi)
      )
    );
  }, [sequence.rootNote, sequence.range, sequence.scale]);

  const triggerSample = (channelIndex: number, step?: StateSequenceStep) => {
    const channel = synthChannels[channelIndex];

    if (!channel || !sequence.midiOutDeviceName) return;

    sendMidiMessage(sequence.midiOutDeviceName, {
      note: synthChannels[channelIndex].midiNote,
      velocity: 127 * (step?.volume ?? 1),
      channel: sequence.midiChannel,
      duration: sequence.noteDuration * getIntervalFromClockSpeed(clockSpeed) * sequence.stepLength,
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
      <InstrumentConfigKnob
        label={`root: ${Midi.midiToNoteName(sequence.rootNote)}`}
        value={sequence.rootNote}
        min={0}
        max={101}
        isIntegerOnly={true}
        onChange={(value) => updateSequence({ rootNote: value })}
      />
      <InstrumentConfigKnob
        label={`note duration: ${sequence.noteDuration}`}
        value={sequence.noteDuration}
        min={0}
        max={1000}
        isIntegerOnly={true}
        onChange={(value) => updateSequence({ noteDuration: value })}
      />
      <InstrumentConfigSelect
        label={`scale: ${sequence.scale}`}
        items={scaleOptions.current}
        onSelect={({ label }) => updateSequence({ scale: label })}
      />
    </>
  );

  return (
    <div className="synth">
      <Sequencer
        {...sequencerProps}
        sequence={sequence}
        channelsConfig={synthChannels}
        triggerCallback={triggerSample}
        instrumentConfigCallback={instrumentConfigCallback}
      />
    </div>
  );
};
