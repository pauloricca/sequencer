import React, { useEffect, useRef } from "react";
import { Howl } from "howler";
import { Sequencer } from "../Sequencer/Sequencer";
import { DrumMachineChannelConfig, DrumMachineProps } from "./DrumMachine.types";
import { sendMidiMessage } from "../../utils/midi";

export const DrumMachine: React.FC<DrumMachineProps> = ({
  ...sequencerProps
}) => {
  const samples = useRef<Howl[]>([]);

  const drumMachineChannels = sequencerProps.sequence
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
    <div className="drum-machine">
      <Sequencer
        {...sequencerProps}
        triggerCallback={triggerSample}
      />
    </div>
  );
};
