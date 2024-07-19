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

export interface DrumMachineProps {
  sequenceId: string;
}

export interface DrumMachineSoundPlayer {
  type: 'sample' | 'line-in';
  samplePlayer?: Tone.Player;
  audioFile?: string;
  userMedia?: Tone.UserMedia;
  envelope?: Tone.AmplitudeEnvelope;
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
      if (!soundPlayers.current[channel.id]) {
        soundPlayers.current[channel.id] = {
          type: channel.type,
          reverb: new Tone.Reverb(0.1),
          pan: new Tone.PanVol(0, 0),
          distortion: new Tone.Distortion(1),
        };
      }

      // Need to load new sample?
      if (
        channel.type === 'sample' &&
        soundPlayers.current[channel.id].audioFile !== channel.audioFile
      ) {
        console.log('paulo init sample', channel.id);
        soundPlayers.current[channel.id].samplePlayer?.stop();
        soundPlayers.current[channel.id].samplePlayer = new Tone.Player(
          `/samples/${channel.audioFile}`
        );
        soundPlayers.current[channel.id].samplePlayer!.chain(
          soundPlayers.current[channel.id].distortion,
          soundPlayers.current[channel.id].pan,
          soundPlayers.current[channel.id].reverb,
          Tone.Destination
        );
      }

      // Need to open line-ins?
      if (channel.type === 'line-in' && !soundPlayers.current[channel.id].userMedia) {
        console.log('paulo init line in', channel.id);
        soundPlayers.current[channel.id].userMedia = new Tone.UserMedia();
        soundPlayers.current[channel.id].envelope = new Tone.AmplitudeEnvelope();
        soundPlayers.current[channel.id].userMedia!.open();
        soundPlayers.current[channel.id].userMedia!.chain(
          soundPlayers.current[channel.id].envelope!,
          soundPlayers.current[channel.id].distortion,
          soundPlayers.current[channel.id].pan,
          soundPlayers.current[channel.id].reverb,
          Tone.Destination
        );
      }
    });

    // Clean up players
    Object.keys(soundPlayers.current).forEach((channelId) => {
      const player = soundPlayers.current[channelId];

      if (player.type === 'line-in') {
        console.log('paulo destroy sample...', channelId);
        destroySamplePlayer(player);
      } else {
        console.log('paulo destroy line in...', channelId);
        destroyLineInPlayer(player);
      }

      if (!sampleOrLineInChannels.find(({ id }) => id === channelId)) {
        console.log('paulo destroy both...', channelId);
        destroySamplePlayer(player);
        destroyLineInPlayer(player);
        delete soundPlayers.current[channelId];
      }
    });
  }, [sampleOrLineInChannels]);

  // TODO: dispose all samples when removing component

  const triggerSample = useCallback((channelIndex: number, step?: StateSequenceStep) => {
    const sequence = useSequencersState
      .getState()
      .sequences.find(({ id }) => id === sequenceId) as StateSequenceDrumMachine;

    const channel = sequence.channelsConfig[channelIndex];

    if (!channel) return;

    const volumePercentage =
      (sequence.channelsConfig[channelIndex].volume ?? 1) * (step?.volume ?? 1);

    if (channel.type === 'sample' || channel.type === 'line-in') {
      // Don't trigger sample if volume is 0
      if (volumePercentage <= 0) return;

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
