import { Icon, InputGroup } from '@blueprintjs/core';
import React, { ReactNode, useState } from 'react';
import { StateSequence } from 'state/state.types';
import { useSequencersState } from 'state/state';
import classNames from 'classnames';
import { SequencerConfigMidiOut } from './SequencerConfigMidiOut/SequencerConfigMidiOut';
import { SelectKnob } from '../../SelectKnob/SelectKnob';
require('./_SequencerConfig.scss');

export interface SequencerConfigProps {
  sequence: StateSequence;
  tools?: Array<{ name: string; value: string | null; icon: string }>;
  selectedTool?: string | null;
  onSelectTool?: (value: string | null) => void;
  sequencerConfigCallback?: () => ReactNode;
}

export const SequencerConfig: React.FC<SequencerConfigProps> = ({
  sequence,
  tools,
  selectedTool,
  onSelectTool = () => {},
  sequencerConfigCallback,
}) => {
  const updateSequence = useSequencersState((state) => state.updateSequence);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={classNames('sequencer-config', {
        'sequencer-config--is-open': isOpen,
      })}
    >
      <div className="sequencer-config__header">
        <p className="sequencer-config__instrument-name">{sequence.name}</p>
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
          {!sequence.isMuted && (
            <Icon
              icon="volume-up"
              className="sequencer-config__tool sequencer-config__tool--is-active"
              onClick={() => updateSequence(sequence.name, { isMuted: true })}
            />
          )}
          {sequence.isMuted && (
            <Icon
              icon="volume-off"
              className="sequencer-config__tool"
              onClick={() => updateSequence(sequence.name, { isMuted: false })}
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
          <InputGroup
            value={sequence.name}
            onValueChange={(value) => updateSequence(sequence.name, { name: value })}
          />
          <SequencerConfigMidiOut sequence={sequence} />
          <SelectKnob
            label={`n steps: ${sequence.nSteps}`}
            type="numeric"
            min={1}
            max={64}
            actionMessage={{
              type: 'Sequence Param Change',
              sequenceName: sequence.name,
              param: 'nSteps',
            }}
            value={sequence.nSteps}
          />
          <SelectKnob
            label={`step length: ${sequence.stepLength}`}
            type="numeric"
            min={1}
            max={32}
            actionMessage={{
              type: 'Sequence Param Change',
              sequenceName: sequence.name,
              param: 'stepLength',
            }}
            value={sequence.stepLength}
          />
          {!!sequencerConfigCallback && sequencerConfigCallback()}
        </div>
      )}
    </div>
  );
};
