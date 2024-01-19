import React, { useEffect, useRef } from "react";
import { Howl } from "howler";
import { Sequencer } from "../Sequencer/Sequencer";
import {
  DrumMachineChannelConfig,
  DrumMachineProps,
} from "./DrumMachine.types";
import { sendMidiMessage } from "../../utils/midi";
import { InstrumentConfig } from "../InstrumentConfig/InstrumentConfig";
import { useSequencersState } from "../../state/state";
import { InstrumentConfigKnob } from "../InstrumentConfig/InstrumentConfigKnob/InstrumentConfigKnob";

export const DrumMachine: React.FC<DrumMachineProps> = ({
  sequence,
  ...sequencerProps
}) => {
  const updateChannelConfig = useSequencersState((state) =>
    state.updateChannelConfig(sequence.name)
  );
  const samples = useRef<Howl[]>([]);

  const drumMachineChannels =
    sequence.channelsConfig as DrumMachineChannelConfig[];

  useEffect(() => {
    drumMachineChannels.forEach((channel, channelIndex) => {
      if (channel.type === "sample") {
        samples.current[channelIndex] = new Howl({
          src: [`/sounds/${channel.soundFile}`],
        });
      }
    });
  }, []);

  const triggerSample = (channelIndex: number) => {
    const channel = drumMachineChannels[channelIndex];

    if (!channel) return;

    if (channel.type === "sample") {
      const sample = samples.current[channelIndex];

      if (sample) {
        sample.stop();
        sample.volume(drumMachineChannels[channelIndex].volume ?? 1);
        sample.play();
      }
    } else if (channel.type === "midi" && sequence.midiOutDeviceName) {
      sendMidiMessage(sequence.midiOutDeviceName, {
        note: channel.note,
        velocity: (sequence.channelsConfig[channelIndex].volume ?? 1) * 127,
        channel: channel.midiChannel,
        duration: 0,
      });
    }
  };

  const getChannelConfigComponents = (channelIndex: number) => (
    <>
      <InstrumentConfigKnob
        label="volume"
        value={sequence.channelsConfig[channelIndex].volume ?? 1}
        speed="fast"
        onChange={(value) =>
          updateChannelConfig(channelIndex)({ volume: value })
        }
      />
    </>
  );

  return (
    <div className="drum-machine instrument">
      <InstrumentConfig sequence={sequence} />
      <Sequencer
        {...sequencerProps}
        sequence={sequence}
        channelsConfig={drumMachineChannels}
        triggerCallback={triggerSample}
        showChannelControls={true}
        channelConfigComponents={getChannelConfigComponents}
      />
    </div>
  );
};
