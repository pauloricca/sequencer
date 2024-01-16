import React, { useEffect, useRef } from "react";
import { Howl } from "howler";
import { Sequencer } from "../Sequencer/Sequencer";
import { DrumMachineChannelConfig, DrumMachineProps } from "./DrumMachine.types";
import { sendMidiMessage } from "../../utils/midi";
import { StateSequenceDrumMachine } from "state/state.types";
import { InstrumentConfig } from "../InstrumentConfig/InstrumentConfig";

export const DrumMachine: React.FC<DrumMachineProps> = ({
  ...sequencerProps
}) => {
  const samples = useRef<Howl[]>([]);

  const drumMachineChannels = (sequencerProps.sequence as StateSequenceDrumMachine)
    .channelsConfig as DrumMachineChannelConfig[];

  useEffect(() => {
    drumMachineChannels.forEach((channel, channelIndex) => {
      if (channel.type === "sample") {
        samples.current[channelIndex] = new Howl({
          src: [`/sounds/${channel.soundFile}`],
        });
      }
    });
  }, []);

  const triggerSample = (sampleIndex: number) => {
    const channel = drumMachineChannels[sampleIndex];

    if (!channel) return;

    if (channel.type === "sample") {
      samples.current[sampleIndex]?.play();
    } else if (channel.type === "midi" && sequencerProps.sequence.midiOutDeviceName) {
      sendMidiMessage(sequencerProps.sequence.midiOutDeviceName, {
        note: channel.note,
        velocity: 127,
        channel: channel.channel,
      });
    }
  };

  return (
    <div className="drum-machine instrument">
      <InstrumentConfig sequence={sequencerProps.sequence} />
      <Sequencer
        {...sequencerProps}
        channelsConfig={drumMachineChannels}
        triggerCallback={triggerSample}
      />
    </div>
  );
};
