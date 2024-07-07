import React, { useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Sequencer } from 'components/Sequencer/Sequencer';
import { sendMidiMessage } from 'utils/midi';
import { useSequencersState } from 'state/state';
import {
  StateSequenceChannelConfigSample,
  StateSequenceDrumMachine,
  StateSequenceStep,
} from 'state/state.types';
import { getAdjustedPitch } from './DrumMachine.utils';
import { isEqual } from 'lodash';
import { DrumMachineChannelConfig } from './DrumMachineChannelConfig/DrumMachineChannelConfig';

export interface DrumMachineProps {
  sequenceId: string;
}

export const DrumMachine: React.FC<DrumMachineProps> = ({ sequenceId }) => {
  const isPlaying = useSequencersState((state) => state.isPlaying);
  const sampleFileNames = useSequencersState(
    (state) =>
      (
        (
          state.sequences.find(({ id }) => id === sequenceId) as StateSequenceDrumMachine
        ).channelsConfig
          .map((channelConfig) => channelConfig.type === 'sample' && channelConfig.audioFile)
          .filter(Boolean) as string[]
      ).sort((a, b) => a.localeCompare(b)),
    isEqual
  );

  // Sample objects indexed by file name
  const samples = useRef<
    Record<
      string,
      { player: Tone.Player; reverb: Tone.Reverb; distortion: Tone.Distortion; pan: Tone.PanVol }
    >
  >({});

  useEffect(() => {
    sampleFileNames.forEach((sampleFileName) => {
      if (!samples.current[sampleFileName]) {
        const reverb = new Tone.Reverb(0.1);
        const pan = new Tone.PanVol(0, 0);
        const distortion = new Tone.Distortion(1);
        const player = new Tone.Player(`/samples/${sampleFileName}`);

        player.chain(distortion, pan, reverb, Tone.Destination);
        samples.current[sampleFileName] = { player, reverb, pan, distortion };
      }
    });
  }, [sampleFileNames]);

  const triggerSample = useCallback((channelIndex: number, step?: StateSequenceStep) => {
    const sequence = useSequencersState
      .getState()
      .sequences.find(({ id }) => id === sequenceId) as StateSequenceDrumMachine;

    const channel = sequence.channelsConfig[channelIndex];

    if (!channel) return;

    const volumePercentage =
      (sequence.channelsConfig[channelIndex].volume ?? 1) * (step?.volume ?? 1);

    if (channel.type === 'sample') {
      const sample = samples.current[channel.audioFile];

      if (sample?.player.loaded) {
        // Don't trigger sample if volume is 0
        if (volumePercentage <= 0) return;

        // on samples we set volume in db, -Infinity to 0, as a Log base 1.1
        const volumeLog20 = Math.log(volumePercentage) / Math.log(1.1);

        const pitchAdjusted =
          (getAdjustedPitch(
            (sequence.channelsConfig[channelIndex] as StateSequenceChannelConfigSample).pitch ?? 1
          ) +
            getAdjustedPitch(step?.pitch ?? 1)) /
          2;

        sample.reverb.wet.value = channel.reverbWetness ?? 0;
        // decay must be > 0
        sample.reverb.decay = 0.01 + (channel.reverbDecay ?? 0);

        sample.pan.pan.value = channel.pan ?? 0;

        sample.distortion.wet.value = channel.distortion ?? 0;

        sample.player.state === 'started' && sample.player.stop();
        sample.player.volume.value = volumeLog20;
        sample.player.playbackRate = pitchAdjusted;
        sample.player.reverse =
          (sequence.channelsConfig[channelIndex] as StateSequenceChannelConfigSample).isReversed ??
          false;
        sample.player.fadeIn = channel.attack ?? 0;
        sample.player.fadeOut = channel.release ?? 0;
        const startRandomnessShift = channel.startRandomness
          ? (Math.random() - 0.5) * sample.player.buffer.duration * channel.startRandomness
          : 0;

        sample.player.start(
          undefined,
          sample.player.buffer.duration * (channel.start ?? 0) + startRandomnessShift,
          sample.player.buffer.duration * (channel.duration ?? 1)
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
    } else if (channel.type === 'midi-cc' && sequence.midiOutDeviceName) {
      sendMidiMessage(sequence.midiOutDeviceName, {
        cc: channel.midiCC,
        value: channel.isFixedValue ? channel.midiCCValue : volumePercentage * 127,
        channel: channel.midiChannel,
      });
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      Object.values(samples.current).forEach(
        (sample) => sample.player.state === 'started' && sample.player.stop()
      );
    }
  }, [isPlaying]);

  return (
    <div className="drum-machine controller__instrument">
      <Sequencer
        sequenceId={sequenceId}
        triggerCallback={triggerSample}
        showChannelControls={true}
        channelConfigComponents={(channelIndex) => (
          <DrumMachineChannelConfig sequenceId={sequenceId} channelIndex={channelIndex} />
        )}
      />
    </div>
  );
};
