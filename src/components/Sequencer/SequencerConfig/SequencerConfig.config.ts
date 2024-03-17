import { ControllerParameterProps } from 'components/Controller/ControllerParameter/ControllerParameter';

export const getSequencerConfigParameterConfig = (
  sequenceName: string
): ControllerParameterProps[] => [
  {
    actionMessage: {
      parameter: 'nSteps',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `n steps: ${value}`,
    type: 'numeric',
    min: 1,
    max: 64,
  },
  {
    actionMessage: {
      parameter: 'stepLength',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `step length: ${value}`,
    type: 'numeric',
    min: 1,
    max: 32,
  },
];
