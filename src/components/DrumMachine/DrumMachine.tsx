import React, { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { Sequencer } from 'components/Sequencer/Sequencer';
import { DrumMachineProps } from './DrumMachine.types';
import { sendMidiMessage } from 'utils/midi';
import { useSequencersState } from 'state/state';
import { InputGroup } from '@blueprintjs/core';
import { StateSequenceChannelConfig, StateSequenceStep } from 'state/state.types';
import { SelectKnob } from 'components/SelectKnob/SelectKnob';

export const DrumMachine: React.FC<DrumMachineProps> = ({ sequence, ...sequencerProps }) => {
  const updateChannelConfig = useSequencersState((state) => state.updateChannelConfig);
  // Sample objects indexed by file name
  const samples = useRef<Record<string, Howl>>({});

  useEffect(() => {
    sequence.channelsConfig.forEach((channel) => {
      if (channel.type === 'sample' && !samples.current[channel.audioFile]) {
        samples.current[channel.audioFile] = new Howl({
          src: [`/sounds/${channel.audioFile}`],
        });
      }
    });
  }, [sequence.channelsConfig]);

  const triggerSample = useCallback(
    (channelIndex: number, step?: StateSequenceStep) => {
      const channel = sequence.channelsConfig[channelIndex];

      if (!channel) return;

      const volume = 1 * (sequence.channelsConfig[channelIndex].volume ?? 1) * (step?.volume ?? 1);

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
    [sequence]
  );

  const getChannelConfigComponents = useCallback(
    (channelIndex: number) => {
      const channelConfig = sequence.channelsConfig[channelIndex];
      const update = (newChannelConfig: Partial<StateSequenceChannelConfig>) =>
        updateChannelConfig(sequence.name, channelIndex, newChannelConfig);

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
              sequenceName: sequence.name,
              channelIndex,
              param: 'volume',
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
    [sequence.channelsConfig]
  );

  return (
    <div className="drum-machine controller__instrument">
      <Sequencer
        {...sequencerProps}
        sequence={sequence}
        channelsConfig={sequence.channelsConfig}
        triggerCallback={triggerSample}
        showChannelControls={true}
        channelConfigComponents={getChannelConfigComponents}
      />
    </div>
  );
};
