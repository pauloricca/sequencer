import React from "react";
import { Sequencer } from "../Sequencer/Sequencer";
import { SynthChannelConfig, SynthChannelConfigMidi, SynthProps } from "./Synth.types";
import { sendMidiMessage } from "../../utils/midi";
import { StateSequenceSynth } from "src/state/state.types";

export const Synth: React.FC<SynthProps> = ({
  ...sequencerProps
}) => {
  const synthSequenceAttributes = (sequencerProps.sequence as StateSequenceSynth);
  const initialNote = synthSequenceAttributes.middleNote - Math.floor(synthSequenceAttributes.range / 2);
  const synthChannels: SynthChannelConfig[] = [];
  for (let note = initialNote; note < initialNote + synthSequenceAttributes.range; note++) {
    synthChannels.push({
      type: "midi",
      name: `${note}`,
      note,
    });
  }

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
    <div className="drum-machine">
      <Sequencer
        {...sequencerProps}
        channelsConfig={synthChannels}
        triggerCallback={triggerSample}
      />
    </div>
  );
};
