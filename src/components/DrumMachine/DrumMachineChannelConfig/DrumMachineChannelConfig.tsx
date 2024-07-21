import { ControllerParameter } from 'components/Controller/ControllerParameter/ControllerParameter';
import * as Tone from 'tone';
import React, { useRef } from 'react';
import { useSequencersState } from 'state/state';
import {
  StateSequenceChannelConfig,
  StateSequenceChannelConfigMidiCC,
  StateSequenceDrumMachine,
} from 'state/state.types';
import { CHANNEL_TYPE_OPTIONS } from '../DrumMachine.constants';
import {
  MIDI_MAX_CC,
  MIDI_MAX_CC_VALUE,
  MIDI_MAX_CHANNELS,
  MIDI_MAX_NOTE,
} from 'components/components.constants';
import { getSamplesFileOptions } from '../DrumMachine.utils';
import { formatPercentage, formatSeconds } from 'utils/formatNumber';
import { isEqual } from 'lodash';

export interface DrumMachineChannelConfigProps {
  sequenceId: string;
  channelIndex: number;
}

let samplePlayer: Tone.Player;

const playSample = (audioFile: string) => {
  samplePlayer?.stop();
  samplePlayer = new Tone.Player(`/samples/${audioFile}`);
  samplePlayer.connect(Tone.Destination);
  samplePlayer.autostart = true;
};

'click mousedown keydown touchstart'
  .split(' ')
  .forEach((ev) => document.addEventListener(ev, () => samplePlayer?.stop()));

export const DrumMachineChannelConfig: React.FC<DrumMachineChannelConfigProps> = ({
  sequenceId,
  channelIndex,
}) => {
  const sequenceName = useSequencersState(
    (state) => state.sequences.find(({ id }) => id === sequenceId)?.name || ''
  );
  const updateChannelConfig = useSequencersState((state) => state.updateChannelConfig);
  const sampleFileOptions = useRef(getSamplesFileOptions());

  // Channel config params we want to trigger render
  const { channelType, isFixedValue } = useSequencersState((state) => {
    const channelConfig = (
      state.sequences.find(({ id }) => id === sequenceId) as StateSequenceDrumMachine
    ).channelsConfig[channelIndex];

    return {
      channelType: channelConfig.type,
      isFixedValue: (channelConfig as StateSequenceChannelConfigMidiCC).isFixedValue,
    };
  }, isEqual);

  const channelConfig = (
    useSequencersState
      .getState()
      .sequences.find(({ id }) => id === sequenceId) as StateSequenceDrumMachine
  ).channelsConfig[channelIndex];

  const update = (newChannelConfig: Partial<StateSequenceChannelConfig>) =>
    updateChannelConfig(sequenceId, channelIndex, newChannelConfig);

  return (
    <>
      <input
        type="text"
        value={channelConfig.name}
        onChange={(ev) => update({ name: (ev.target as HTMLInputElement).value })}
      />
      <ControllerParameter
        labelCallback={() => 'volume'}
        type="numeric"
        step={0.05}
        defaultValue={1}
        actionMessage={{
          type: 'Channel Param Change',
          sequenceName,
          channelIndex,
          parameter: 'volume',
        }}
        showDial
      />
      <ControllerParameter
        labelCallback={(value) => value}
        items={CHANNEL_TYPE_OPTIONS}
        type="discrete"
        clickOnModalButtonClosesModal
        actionMessage={{
          type: 'Channel Param Change',
          sequenceName,
          channelIndex,
          parameter: 'type',
        }}
        modalColumns={4}
      />
      {(channelType === 'midi' || channelType === 'midi-cc') && (
        <ControllerParameter
          labelCallback={(value) => `midi channel: ${value ?? 'none'}`}
          type="numeric"
          max={MIDI_MAX_CHANNELS}
          clickOnModalButtonClosesModal
          actionMessage={{
            type: 'Channel Param Change',
            sequenceName,
            channelIndex,
            parameter: 'midiChannel',
          }}
        />
      )}
      {channelType === 'midi' && (
        <ControllerParameter
          labelCallback={(value) => `midi note: ${value ?? 'none'}`}
          type="numeric"
          max={MIDI_MAX_NOTE}
          clickOnModalButtonClosesModal
          actionMessage={{
            type: 'Channel Param Change',
            sequenceName,
            channelIndex,
            parameter: 'midiNote',
          }}
        />
      )}
      {channelType === 'midi-cc' && (
        <>
          <ControllerParameter
            labelCallback={(value) => `midi cc: ${value ?? 'none'}`}
            type="numeric"
            max={MIDI_MAX_CC}
            clickOnModalButtonClosesModal
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'midiCC',
            }}
          />
          <ControllerParameter
            labelCallback={(value) => (value ? 'fixed value' : 'value set by volume')}
            items={[
              { value: true, label: 'fixed value' },
              { value: false, label: 'value set by volume' },
            ]}
            modalColumns={2}
            type="discrete"
            clickOnModalButtonClosesModal
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'isFixedValue',
            }}
          />
          {isFixedValue && (
            <ControllerParameter
              labelCallback={(value) => `midi cc value: ${value ?? 'none'}`}
              type="numeric"
              max={MIDI_MAX_CC_VALUE}
              clickOnModalButtonClosesModal
              actionMessage={{
                type: 'Channel Param Change',
                sequenceName,
                channelIndex,
                parameter: 'midiCCValue',
              }}
            />
          )}
        </>
      )}
      {channelType === 'sample' && (
        <>
          <ControllerParameter
            labelCallback={(value) => value ?? 'audio file'}
            items={sampleFileOptions.current}
            isItemsHierarchical
            type="discrete"
            modalColumns={2}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'audioFile',
            }}
            onChange={playSample}
          />
          <ControllerParameter
            labelCallback={(value) => `pitch: ${value}`}
            type="numeric"
            min={0}
            max={2}
            step={0.05}
            defaultValue={1}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'pitch',
            }}
            showDial
          />
          <ControllerParameter
            labelCallback={(value) => `start: ${formatPercentage(value)}`}
            type="numeric"
            valueFormatter={formatPercentage}
            step={0.01}
            defaultValue={0}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'start',
            }}
            speed={3}
            showDial
          />
          <ControllerParameter
            labelCallback={(value) => `start rand: ${formatPercentage(value)}`}
            type="numeric"
            valueFormatter={formatPercentage}
            step={0.01}
            defaultValue={0}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'startRandomness',
            }}
            speed={3}
            showDial
          />
          <ControllerParameter
            labelCallback={(value) => `duration: ${formatPercentage(value)}`}
            type="numeric"
            valueFormatter={formatPercentage}
            step={0.01}
            defaultValue={1}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'duration',
            }}
            speed={3}
            showDial
          />
          <ControllerParameter
            labelCallback={(value) => (value ? 'reverse' : 'forward')}
            items={[
              { value: false, key: 'forward', label: 'forward' },
              { value: true, key: 'reverse', label: 'reverse' },
            ]}
            modalColumns={2}
            type="discrete"
            clickOnModalButtonClosesModal
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'isReversed',
            }}
          />
        </>
      )}
      {(channelType === 'sample' || channelType === 'line-in') && (
        <>
          <ControllerParameter
            labelCallback={(value) => `attack: ${formatSeconds(value)}`}
            type="numeric"
            valueFormatter={formatSeconds}
            step={0.05}
            max={5}
            defaultValue={0}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'attack',
            }}
            showDial
          />
          <ControllerParameter
            labelCallback={(value) => `release: ${formatSeconds(value)}`}
            type="numeric"
            valueFormatter={formatSeconds}
            step={0.05}
            max={5}
            defaultValue={0}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'release',
            }}
            showDial
          />
          {channelType === 'line-in' && (
            <>
              <ControllerParameter
                labelCallback={(value) => `decay: ${formatSeconds(value)}`}
                type="numeric"
                valueFormatter={formatSeconds}
                step={0.05}
                max={5}
                defaultValue={0}
                actionMessage={{
                  type: 'Channel Param Change',
                  sequenceName,
                  channelIndex,
                  parameter: 'decay',
                }}
                showDial
              />
              <ControllerParameter
                labelCallback={(value) => `sustain: ${formatPercentage(value)}`}
                type="numeric"
                valueFormatter={formatPercentage}
                step={0.05}
                defaultValue={1}
                actionMessage={{
                  type: 'Channel Param Change',
                  sequenceName,
                  channelIndex,
                  parameter: 'sustain',
                }}
                showDial
              />
              <ControllerParameter
                labelCallback={(value) => `gate: ${formatPercentage(value)}`}
                type="numeric"
                valueFormatter={formatPercentage}
                step={0.05}
                defaultValue={1}
                actionMessage={{
                  type: 'Channel Param Change',
                  sequenceName,
                  channelIndex,
                  parameter: 'gate',
                }}
                showDial
              />
            </>
          )}
          <ControllerParameter
            labelCallback={(value) => `reverb decay: ${formatSeconds(value)}`}
            type="numeric"
            valueFormatter={formatSeconds}
            step={0.1}
            max={5}
            defaultValue={0}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'reverbDecay',
            }}
            showDial
          />
          <ControllerParameter
            labelCallback={(value) => `reverb wetness: ${formatPercentage(value)}`}
            type="numeric"
            valueFormatter={formatPercentage}
            step={0.05}
            defaultValue={0}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'reverbWetness',
            }}
            showDial
          />
          <ControllerParameter
            labelCallback={(value) => `pan (${!value ? '|' : value < 0 ? '<' : '>'}): ${value}`}
            type="numeric"
            min={-1}
            max={1}
            step={0.1}
            defaultValue={0}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'pan',
            }}
            showDial
          />
          <ControllerParameter
            labelCallback={(value) => `distortion: ${formatPercentage(value)}`}
            type="numeric"
            valueFormatter={formatPercentage}
            step={0.05}
            defaultValue={0}
            actionMessage={{
              type: 'Channel Param Change',
              sequenceName,
              channelIndex,
              parameter: 'distortion',
            }}
            showDial
          />
        </>
      )}
    </>
  );
};
