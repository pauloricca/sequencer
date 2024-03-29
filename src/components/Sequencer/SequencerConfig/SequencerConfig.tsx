import { Icon } from '@blueprintjs/core';
import React, { ReactNode, useState } from 'react';
import { useSequencersState } from 'state/state';
import classNames from 'classnames';
import { SequencerConfigMidiOut } from './SequencerConfigMidiOut/SequencerConfigMidiOut';
import { ControllerParameter } from 'components/Controller/ControllerParameter/ControllerParameter';
import { getSequencerConfigParameterConfig } from './SequencerConfig.config';
require('./_SequencerConfig.scss');

export interface SequencerConfigProps {
  sequenceName: string;
  tools?: Array<{ name: string; value: string | null; icon: string }>;
  selectedTool?: string | null;
  onSelectTool?: (value: string | null) => void;
  sequencerConfigCallback?: () => ReactNode;
}

export const SequencerConfig: React.FC<SequencerConfigProps> = ({
  sequenceName,
  tools,
  selectedTool,
  onSelectTool = () => {},
  sequencerConfigCallback,
}) => {
  const isMuted = useSequencersState(
    (state) => state.sequences.find(({ name }) => name === sequenceName)?.isMuted
  );
  const updateSequence = useSequencersState((state) => state.updateSequence);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={classNames('sequencer-config', {
        'sequencer-config--is-open': isOpen,
      })}
    >
      <div className="sequencer-config__header">
        <p className="sequencer-config__instrument-name">{sequenceName}</p>
        <div className="sequencer-config__tools">
          {tools?.map(({ name, value, icon }) => (
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
              onClick={() => updateSequence(sequenceName, { isMuted: true })}
            />
          )}
          {isMuted && (
            <Icon
              icon="volume-off"
              className="sequencer-config__tool"
              onClick={() => updateSequence(sequenceName, { isMuted: false })}
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
            <Icon icon="cog" className="sequencer-config__tool" onClick={() => setIsOpen(true)} />
          )}
        </div>
      </div>
      {isOpen && (
        <div className="sequencer-config__controls">
          <SequencerConfigMidiOut sequenceName={sequenceName} />
          {getSequencerConfigParameterConfig(sequenceName).map((parameterConfig) => (
            <ControllerParameter
              key={parameterConfig.actionMessage.parameter}
              {...parameterConfig}
            />
          ))}
          {!!sequencerConfigCallback && sequencerConfigCallback()}
        </div>
      )}
    </div>
  );
};
