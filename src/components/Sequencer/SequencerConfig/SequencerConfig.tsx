import { Icon } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import { useSequencersState } from 'state/state';
import classNames from 'classnames';
import { SequencerConfigMidiOut } from './SequencerConfigMidiOut/SequencerConfigMidiOut';
import { ControllerParameter } from 'components/Controller/ControllerParameter/ControllerParameter';
import { getSequencerConfigParameterConfig } from './SequencerConfig.config';
import { SequencerConfigProps } from './SequencerConfig.types';
import { allSoundsOff } from 'utils/midi';
require('./_SequencerConfig.scss');

export const SequencerConfig: React.FC<SequencerConfigProps> = ({
  sequenceId,
  tools,
  selectedTool,
  onSelectTool = () => {},
  sequencerConfigCallback,
  configControls,
}) => {
  const isMuted = useSequencersState(
    (state) => state.sequences.find(({ id }) => id === sequenceId)?.isMuted
  );
  const midiOutDeviceName = useSequencersState(
    (state) => state.sequences.find(({ id }) => id === sequenceId)?.midiOutDeviceName
  );
  const sequenceName = useSequencersState(
    (state) => state.sequences.find(({ id }) => id === sequenceId)?.name || ''
  );
  const updateSequence = useSequencersState((state) => state.updateSequence);
  const [isOpen, setIsOpen] = useState(false);

  // Close the config panel we pass config controls
  useEffect(() => {
    if (isOpen && configControls) {
      setIsOpen(false);
    }
  }, [configControls]);

  useEffect(() => {
    isMuted && allSoundsOff(midiOutDeviceName);
  }, [isMuted]);

  return (
    <div
      className={classNames('sequencer-config', {
        'sequencer-config--is-open': isOpen,
      })}
    >
      <div className="sequencer-config__header">
        <p className="sequencer-config__instrument-name">{sequenceName}</p>
        <div className="sequencer-config__tools">
          {tools
            .filter(({ isHidden }) => !isHidden)
            .map(({ name, value, icon }) => (
              <Icon
                icon={icon}
                key={name ?? value}
                className={classNames('sequencer-config__tool', {
                  'sequencer-config__tool--is-active': value === selectedTool,
                })}
                onClick={() => onSelectTool(value)}
              />
            ))}
          {!isMuted && (
            <Icon
              icon="volume-up"
              className="sequencer-config__tool sequencer-config__tool--is-active"
              onClick={() => updateSequence(sequenceId, { isMuted: true })}
            />
          )}
          {isMuted && (
            <Icon
              icon="volume-off"
              className="sequencer-config__tool"
              onClick={() => updateSequence(sequenceId, { isMuted: false })}
            />
          )}
          {isOpen && (
            <Icon
              icon="cross"
              className="sequencer-config__tool sequencer-config__tool--is-active"
              onClick={() => setIsOpen(false)}
            />
          )}
          {!isOpen && (
            <Icon
              icon="cog"
              className="sequencer-config__tool"
              onClick={() => {
                setIsOpen(true);
                configControls && onSelectTool(null);
              }}
            />
          )}
        </div>
      </div>
      {isOpen && (
        <div className="sequencer-config__controls">
          <SequencerConfigMidiOut sequenceId={sequenceId} />
          {getSequencerConfigParameterConfig(sequenceName).map((parameterConfig) => (
            <ControllerParameter
              key={parameterConfig.actionMessage.parameter}
              {...parameterConfig}
            />
          ))}
          {!!sequencerConfigCallback && sequencerConfigCallback()}
        </div>
      )}
      {!!configControls && <div className="sequencer-config__controls">{configControls}</div>}
    </div>
  );
};
