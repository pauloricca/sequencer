import React, { useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Sequencer } from 'components/Sequencer/Sequencer';
import { sendMidiMessage } from 'utils/midi';
import { useSequencersState } from 'state/state';
import { InputGroup } from '@blueprintjs/core';
import {
  StateSequenceChannelConfig,
  StateSequenceChannelConfigSample,
  StateSequenceDrumMachine,
  StateSequenceStep,
} from 'state/state.types';
import { SelectKnob } from 'components/SelectKnob/SelectKnob';

export interface DrumMachineProps {
  sequenceName: string;
}

export const DrumMachine: React.FC<DrumMachineProps> = ({ sequenceName }) => {
  const isPlaying = useSequencersState((state) => state.isPlaying);
  const channelsConfig = useSequencersState(
    (state) =>
      (state.sequences.find(({ name }) => name === sequenceName) as StateSequenceDrumMachine)
        .channelsConfig
  );
  const updateChannelConfig = useSequencersState((state) => state.updateChannelConfig);
  // Sample objects indexed by file name
  const samples = useRef<
    Record<string, { player: Tone.Player; reverb: Tone.Reverb; distortion: Tone.Distortion }>
  >({});

  useEffect(() => {
    channelsConfig.forEach((channel) => {
      if (channel.type === 'sample' && !samples.current[channel.audioFile]) {
        const reverb = new Tone.Reverb(0.1).toDestination();
        const distortion = new Tone.Distortion(1).connect(reverb);
        const player = new Tone.Player(`/sounds/${channel.audioFile}`);

        player.chain(distortion, reverb, Tone.Destination);
        samples.current[channel.audioFile] = { player, reverb, distortion };
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

      const volumePercentage =
        (sequence.channelsConfig[channelIndex].volume ?? 1) * (step?.volume ?? 1);

      if (channel.type === 'sample') {
        const sample = samples.current[channel.audioFile];

        if (sample) {
          // on samples we set volume in db, -Infinity to 0, as a Log base 1.1
          const volumeLog20 = Math.log(volumePercentage) / Math.log(1.1);

          sample.reverb.wet.value = channel.reverbWetness ?? 0;
          sample.reverb.decay = 0.1 + (channel.reverbDecay ?? 0);

          sample.distortion.wet.value = channel.distortion ?? 0;

          sample.player.state === 'started' && sample.player.stop();
          sample.player.volume.value = volumeLog20;
          sample.player.playbackRate =
            (sequence.channelsConfig[channelIndex] as StateSequenceChannelConfigSample).pitch ?? 1;
          sample.player.reverse =
            (sequence.channelsConfig[channelIndex] as StateSequenceChannelConfigSample)
              .isReversed ?? false;
          sample.player.fadeIn = channel.attack ?? 0;
          sample.player.fadeOut = channel.release ?? 0;
          sample.player.start(
            undefined,
            sample.player.buffer.duration * (channel.start ?? 0),
            sample.player.buffer.duration * (channel.end ?? 1) -
              sample.player.buffer.duration * (channel.start ?? 0)
          );
        }
      } else if (channel.type === 'midi' && sequence.midiOutDeviceName) {
        if (channel.volumeCC !== undefined) {
          sendMidiMessage(sequence.midiOutDeviceName, {
            cc: channel.volumeCC,
            value: volumePercentage * 127,
            channel: channel.midiChannel,
          });
        }
        sendMidiMessage(sequence.midiOutDeviceName, {
          note: channel.midiNote,
          velocity: volumePercentage * 127,
          channel: channel.midiChannel,
        });
      }
    },
    [sequenceName]
  );

  useEffect(() => {
    if (!isPlaying) {
      Object.values(samples.current).forEach(
        (sample) => sample.player.state === 'started' && sample.player.stop()
      );
    }
  }, [isPlaying]);

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
            <>
              <InputGroup
                value={channelConfig.audioFile ?? 'audio file'}
                onValueChange={(value) => update({ audioFile: value })}
              />
              <SelectKnob
                label={`pitch: ${channelConfig.pitch ?? 1}`}
                value={channelConfig.pitch ?? 1}
                type="numeric"
                min={0}
                max={10}
                step={0.05}
                onChange={(value) => update({ pitch: value })}
                showDial
              />
              <SelectKnob
                label={`start: ${Math.round((channelConfig.start ?? 0) * 100)}%`}
                value={channelConfig.start ?? 0}
                type="numeric"
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => update({ start: value })}
                showDial
              />
              <SelectKnob
                label={`end: ${Math.round((channelConfig.end ?? 1) * 100)}%`}
                value={channelConfig.end ?? 1}
                type="numeric"
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => update({ end: value })}
                showDial
              />
              <SelectKnob
                label={`attack: ${channelConfig.attack ?? 0}s`}
                value={channelConfig.attack ?? 0}
                type="numeric"
                min={0}
                max={5}
                step={0.05}
                onChange={(value) => update({ attack: value })}
                showDial
              />
              <SelectKnob
                label={`release: ${channelConfig.release ?? 0}s`}
                value={channelConfig.release ?? 0}
                type="numeric"
                min={0}
                max={5}
                step={0.05}
                onChange={(value) => update({ release: value })}
                showDial
              />
              <SelectKnob
                label={`reverb decay: ${channelConfig.reverbDecay ?? 0}s`}
                value={channelConfig.reverbDecay ?? 0}
                type="numeric"
                min={0}
                max={5}
                step={0.1}
                onChange={(value) => update({ reverbDecay: value })}
                showDial
              />
              <SelectKnob
                label={`reverb wetness: ${Math.round((channelConfig.reverbWetness ?? 0) * 100)}%`}
                value={channelConfig.reverbWetness ?? 0}
                type="numeric"
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => update({ reverbWetness: value })}
                showDial
              />
              <SelectKnob
                label={`distortion: ${channelConfig.distortion ?? 0}`}
                value={channelConfig.distortion ?? 0}
                type="numeric"
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => update({ distortion: value })}
                showDial
              />
              <SelectKnob
                label={`direction: ${channelConfig.isReversed ? 'reverse' : 'forward'}`}
                value={channelConfig.isReversed ?? false}
                type="discrete"
                items={[
                  { value: false, key: 'forward', label: 'forward' },
                  { value: true, key: 'reverse', label: 'reverse' },
                ]}
                onChange={(value) => update({ isReversed: value })}
              />
            </>
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
