import { ControllerParameterProps } from 'components/Controller/ControllerParameter/ControllerParameter';

export const getSequencerConfigMutationParameterConfig = (
  sequenceName: string
): ControllerParameterProps[] => [
  {
    actionMessage: {
      parameter: 'mutationAmount',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `mutation: ${Math.round((value || 0) * 100)}%`,
    type: 'numeric',
    min: 0,
    max: 1,
    step: 0.02,
    showDial: true,
  },
];
