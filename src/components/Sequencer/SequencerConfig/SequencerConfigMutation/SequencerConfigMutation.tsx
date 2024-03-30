import React from 'react';
import { ControllerParameter } from 'components/Controller/ControllerParameter/ControllerParameter';
import { SequencerConfigMutationProps } from './SequencerConfigMutation.types';
import { getSequencerConfigMutationParameterConfig } from './SequencerConfigMutation.config';

export const SequencerConfigMutation: React.FC<SequencerConfigMutationProps> = ({
  sequenceName,
}) => {
  return (
    <>
      {getSequencerConfigMutationParameterConfig(sequenceName).map((parameterConfig) => (
        <ControllerParameter key={parameterConfig.actionMessage.parameter} {...parameterConfig} />
      ))}
    </>
  );
};
