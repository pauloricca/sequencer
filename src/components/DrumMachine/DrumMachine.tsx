import React, { useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Sequencer } from 'components/Sequencer/Sequencer';
import { sendMidiMessage } from 'utils/midi';
import { useSequencersState } from 'state/state';
import {
  StateSequenceChannelConfigLineIn,
  StateSequenceChannelConfigSample,
  StateSequenceDrumMachine,
  StateSequenceStep,
} from 'state/state.types';
import { getAdjustedPitch } from './DrumMachine.utils';
import { isEqual } from 'lodash';
import { DrumMachineChannelConfig } from './DrumMachineChannelConfig/DrumMachineChannelConfig';
import { getIntervalFromClockSpeed } from 'state/state.utils';
import { HIGHEST_FREQUENCY } from './DrumMachine.constants';

export interface DrumMachineProps {
  sequenceId: string;
}

export interface DrumMachineSoundPlayer {
  type: 'sample' | 'line-in';
  samplePlayer?: Tone.Player;
  audioFile?: string;
  userMedia?: Tone.UserMedia;
  envelope?: Tone.AmplitudeEnvelope;
  lowPassFilter: Tone.Filter;
  highPassFilter: Tone.Filter;
  reverb: Tone.Reverb;
  distortion: Tone.Distortion;
  pan: Tone.PanVol;
}

export const DrumMachine: React.FC<DrumMachineProps> = ({ sequenceId }) => {
  const isPlaying = useSequencersState((state) => state.isPlaying);
  const sampleOrLineInChannels = useSequencersState(
    (state) =>
      (
        state.sequences.find(({ id }) => id === sequenceId) as StateSequenceDrumMachine
      ).channelsConfig
        .filter(
          (channelConfig) =>
            (channelConfig.type === 'sample' && channelConfig.audioFile) ||
            channelConfig.type === 'line-in'
        )
        .map((channel) => ({
          id: channel.id,
          type: channel.type as 'line-in' | 'sample',
          audioFile: (channel as StateSequenceChannelConfigSample).audioFile,
        })),
    isEqual
  );

  // Sound players (samples and line in) and effects indexed by channel id
  const soundPlayers = useRef<Record<string, DrumMachineSoundPlayer>>({});

  const destroySamplePlayer = (player: DrumMachineSoundPlayer) => {
    player.samplePlayer?.stop();
    player.samplePlayer?.disconnect();
    player.samplePlayer?.dispose();
    player.samplePlayer = undefined;
    player.audioFile = undefined;
  };

  const destroyLineInPlayer = (player: DrumMachineSoundPlayer) => {
    player.userMedia?.close();
    player.userMedia?.disconnect();
    player.userMedia?.dispose();
    player.userMedia = undefined;
    player.envelope = undefined;
  };

  useEffect(() => {
    sampleOrLineInChannels.forEach((channel) => {
      let soundPlayer = soundPlayers.current[channel.id];

      if (!soundPlayer) {
        soundPlayer = soundPlayers.current[channel.id] = {
          type: channel.type,
          reverb: new Tone.Reverb(0.1),
          pan: new Tone.PanVol(0, 0),
          distortion: new Tone.Distortion(1),
          lowPassFilter: new Tone.Filter(HIGHEST_FREQUENCY, 'lowpass'),
          highPassFilter: new Tone.Filter(0, 'highpass'),
        };
      }

      // Need to load new sample?
      if (channel.type === 'sample' && soundPlayer.audioFile !== channel.audioFile) {
        soundPlayer.type = 'sample';
        soundPlayer.samplePlayer?.stop();
        soundPlayer.samplePlayer = new Tone.Player(`/samples/${channel.audioFile}`);
        soundPlayer.samplePlayer!.chain(
          soundPlayer.distortion,
          soundPlayer.lowPassFilter,
          soundPlayer.highPassFilter,
          soundPlayer.pan,
          soundPlayer.reverb,
          Tone.Destination
        );
      }

      // Need to open line-ins?
      if (channel.type === 'line-in' && !soundPlayer.userMedia) {
        soundPlayer.type = 'line-in';
        soundPlayer.userMedia = new Tone.UserMedia();
        soundPlayer.envelope = new Tone.AmplitudeEnvelope();
        soundPlayer.userMedia!.open();
        soundPlayer.userMedia!.chain(
          soundPlayer.envelope!,
          soundPlayer.distortion,
          soundPlayer.lowPassFilter,
          soundPlayer.highPassFilter,
          soundPlayer.pan,
          soundPlayer.reverb,
          Tone.Destination
        );
      }
    });

    // Clean up players
    Object.keys(soundPlayers.current).forEach((channelId) => {
      const player = soundPlayers.current[channelId];

      if (player.type === 'line-in') {
        destroySamplePlayer(player);
      } else {
        destroyLineInPlayer(player);
      }

      if (!sampleOrLineInChannels.find(({ id }) => id === channelId)) {
        destroySamplePlayer(player);
        destroyLineInPlayer(player);
        delete soundPlayers.current[channelId];
      }
    });
  }, [sampleOrLineInChannels]);

  // destroy all samples when removing component
  useEffect(
    () => () =>
      Object.keys(soundPlayers.current).forEach((channelId) => {
        destroySamplePlayer(soundPlayers.current[channelId]);
        destroyLineInPlayer(soundPlayers.current[channelId]);
      }),
    []
  );

  const triggerSample = useCallback((channelIndex: number, step?: StateSequenceStep) => {
    const sequence = useSequencersState
      .getState()
      .sequences.find(({ id }) => id === sequenceId) as StateSequenceDrumMachine;

    const channel = sequence.channelsConfig[channelIndex];

    if (!channel) return;

    let volumePercentage =
      (sequence.channelsConfig[channelIndex].volume ?? 1) * (step?.volume ?? 1);

    if (channel.type === 'sample' || channel.type === 'line-in') {
      // Don't trigger sample if volume is 0
      if (volumePercentage <= 0) return;

      // If we only use filters as velocity strategy, we should remove the step volume from influencing the volume
      if (channel.velocityStrategy === 'hpf' || channel.velocityStrategy === 'lpf') {
        volumePercentage /= step?.volume ?? 1;
      }

      const player = soundPlayers.current[channel.id];

      // on samples we set volume in db, -Infinity to 0, as a Log base 1.1
      const volumeLog20 = Math.log(volumePercentage) / Math.log(1.1);

      const sampleChannel = channel as StateSequenceChannelConfigSample;

      const pitchAdjusted =
        (getAdjustedPitch(sampleChannel.pitch ?? 1) + getAdjustedPitch(step?.pitch ?? 1)) / 2;

      player.reverb.wet.value = channel.reverbWetness ?? 0;
      // decay must be > 0
      player.reverb.decay = 0.01 + (channel.reverbDecay ?? 0);
      player.pan.pan.value = channel.pan ?? 0;
      player.distortion.wet.value = channel.distortion ?? 0;
      player.lowPassFilter.frequency.value = channel.lowPassFilterFrequency ?? HIGHEST_FREQUENCY;
      player.highPassFilter.frequency.value = channel.highPassFilterFrequency ?? 0;

      if (channel.velocityStrategy === 'lpf' || channel.velocityStrategy === 'vol+lpf') {
        player.lowPassFilter.frequency.value *= step?.volume ?? 1;
      }

      if (channel.velocityStrategy === 'hpf' || channel.velocityStrategy === 'vol+hpf') {
        player.highPassFilter.frequency.value =
          HIGHEST_FREQUENCY -
          (HIGHEST_FREQUENCY - player.highPassFilter.frequency.value) * (step?.volume ?? 1);
      }

      if (player.type === 'sample' && player.samplePlayer?.loaded) {
        player.samplePlayer.state === 'started' && player.samplePlayer.stop();
        player.samplePlayer.volume.value = volumeLog20;
        player.samplePlayer.playbackRate = pitchAdjusted;
        player.samplePlayer.reverse = sampleChannel.isReversed ?? false;
        player.samplePlayer.fadeIn = channel.attack ?? 0;
        player.samplePlayer.fadeOut = channel.release ?? 0;

        const startRandomnessShift = sampleChannel.startRandomness
          ? (Math.random() - 0.5) *
            player.samplePlayer.buffer.duration *
            sampleChannel.startRandomness
          : 0;

        player.samplePlayer.start(
          undefined,
          player.samplePlayer.buffer.duration * (sampleChannel.start ?? 0) + startRandomnessShift,
          player.samplePlayer.buffer.duration * (sampleChannel.duration ?? 1)
        );
      } else if (player.type === 'line-in') {
        const clockSpeed = useSequencersState.getState().clockSpeed;

        if (!player.envelope || !player.userMedia) return;

        const lineInChannel = channel as StateSequenceChannelConfigLineIn;

        player.envelope.attack = channel.attack ?? 0;
        player.envelope.decay = lineInChannel.decay ?? 0;
        player.envelope.sustain = lineInChannel.sustain ?? 1;
        player.envelope.release = channel.release ?? 0;

        const durationMillis =
          (step?.duration || 1) *
          getIntervalFromClockSpeed(clockSpeed) *
          sequence.stepLength *
          (lineInChannel.gate ?? 1);

        player.envelope.triggerAttackRelease(durationMillis / 1000, undefined, volumePercentage);
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
      Object.values(soundPlayers.current).forEach(
        (sample) => sample.samplePlayer?.state === 'started' && sample.samplePlayer.stop()
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
