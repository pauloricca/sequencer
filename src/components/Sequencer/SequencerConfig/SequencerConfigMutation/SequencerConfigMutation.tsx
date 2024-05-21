import React from 'react';
import { ControllerParameter } from 'components/Controller/ControllerParameter/ControllerParameter';
import { SequencerConfigMutationProps } from './SequencerConfigMutation.types';
import { getSequencerConfigMutationParameterConfig } from './SequencerConfigMutation.config';
import { useSequencersState } from 'state/state';

export const SequencerConfigMutation: React.FC<SequencerConfigMutationProps> = ({ sequenceId }) => {
  const sequenceName = useSequencersState(
    (state) => state.sequences.find(({ id }) => id === sequenceId)?.name || ''
  );

  return (
    <>
      {getSequencerConfigMutationParameterConfig(sequenceName).map((parameterConfig) => (
        <ControllerParameter key={parameterConfig.actionMessage.parameter} {...parameterConfig} />
      ))}
    </>
  );
};
