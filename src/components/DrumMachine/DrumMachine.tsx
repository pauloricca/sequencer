import React, { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { Sequencer } from 'components/Sequencer/Sequencer';
import { sendMidiMessage } from 'utils/midi';
import { useSequencersState } from 'state/state';
import { InputGroup } from '@blueprintjs/core';
import {
  StateSequenceChannelConfig,
  StateSequenceDrumMachine,
  StateSequenceStep,
} from 'state/state.types';
import { SelectKnob } from 'components/SelectKnob/SelectKnob';

export interface DrumMachineProps {
  sequenceName: string;
}

export const DrumMachine: React.FC<DrumMachineProps> = ({ sequenceName }) => {
  const channelsConfig = useSequencersState(
    (state) =>
      (state.sequences.find(({ name }) => name === sequenceName) as StateSequenceDrumMachine)
        .channelsConfig
  );
  const updateChannelConfig = useSequencersState((state) => state.updateChannelConfig);
  // Sample objects indexed by file name
  const samples = useRef<Record<string, Howl>>({});

  useEffect(() => {
    channelsConfig.forEach((channel) => {
      if (channel.type === 'sample' && !samples.current[channel.audioFile]) {
        samples.current[channel.audioFile] = new Howl({
          src: [`/sounds/${channel.audioFile}`],
        });
      }
    });
  }, [channelsConfig]);

  const triggerSample = useCallback(
    (channelIndex: number, step?: StateSequenceStep) => {
      const sequence = useSequencersState
        .getState()
        .sequences.find(({ name }) => name === sequenceName) as StateSequenceDrumMachine;

      const channel = sequence.channelsConfig[channelIndex];

      if (!channel) return;

      const volume = 1 * (channelsConfig[channelIndex].volume ?? 1) * (step?.volume ?? 1);

      if (channel.type === 'sample') {
        const sample = samples.current[channel.audioFile];

        if (sample) {
          sample.stop();
          sample.volume(volume);
          sample.play();
        }
      } else if (channel.type === 'midi' && sequence.midiOutDeviceName) {
        if (channel.volumeCC !== undefined) {
          sendMidiMessage(sequence.midiOutDeviceName, {
            cc: channel.volumeCC,
            value: volume * 127,
            channel: channel.midiChannel,
          });
        }
        sendMidiMessage(sequence.midiOutDeviceName, {
          note: channel.midiNote,
          velocity: volume * 127,
          channel: channel.midiChannel,
        });
      }
    },
    [sequenceName]
  );

  const getChannelConfigComponents = useCallback(
    (channelIndex: number) => {
      const channelConfig = channelsConfig[channelIndex];
      const update = (newChannelConfig: Partial<StateSequenceChannelConfig>) =>
        updateChannelConfig(sequenceName, channelIndex, newChannelConfig);

      return (
        <>
          <InputGroup
            value={channelConfig.name}
            onValueChange={(value) => update({ name: value })}
          />
          <SelectKnob
            label="volume"
            type="numeric"
            step={0.05}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'volume',
            }}
            value={channelConfig.volume ?? 1}
            showDial
            speed={15}
          />
          <SelectKnob
            label={`${channelConfig.type}`}
            items={[{ value: 'midi' }, { value: 'sample' }]}
            type="discrete"
            onChange={(value) => update({ type: value })}
            value={channelConfig.type}
          />
          {channelConfig.type === 'midi' && (
            <>
              <SelectKnob
                label={`midi channel: ${channelConfig.midiChannel ?? 'none'}`}
                value={channelConfig.midiChannel}
                type="numeric"
                min={0}
                max={32}
                onChange={(value) => update({ midiChannel: value })}
              />
              <SelectKnob
                label={`midi note: ${channelConfig.midiNote ?? 'none'}`}
                value={channelConfig.midiNote}
                type="numeric"
                min={0}
                max={101}
                onChange={(value) => update({ midiNote: value })}
              />
            </>
          )}
          {channelConfig.type === 'sample' && (
            <InputGroup
              value={channelConfig.audioFile ?? 'audio file'}
              onValueChange={(value) => update({ audioFile: value })}
            />
          )}
        </>
      );
    },
    [channelsConfig]
  );

  return (
    <div className="drum-machine controller__instrument">
      <Sequencer
        sequenceName={sequenceName}
        channelsConfig={channelsConfig}
        triggerCallback={triggerSample}
        showChannelControls={true}
        channelConfigComponents={getChannelConfigComponents}
      />
    </div>
  );
};
