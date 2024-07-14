import { ControllerParameterProps } from 'components/Controller/ControllerParameter/ControllerParameter';
import { formatPercentage, formatSeconds } from 'utils/formatNumber';

export const getLineInConfigParameterConfig = (
  sequenceName: string
): ControllerParameterProps[] => [
  {
    actionMessage: {
      parameter: 'gate',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `gate: ${formatPercentage(value)}`,
    valueFormatter: formatPercentage,
    type: 'numeric',
    defaultValue: 1,
    min: 0,
    max: 1,
    step: 0.1,
    showDial: true,
  },
  {
    actionMessage: {
      parameter: 'attack',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `attack: ${formatSeconds(value)}`,
    valueFormatter: formatSeconds,
    type: 'numeric',
    defaultValue: 0,
    min: 0,
    max: 1,
    step: 0.05,
    showDial: true,
  },
  {
    actionMessage: {
      parameter: 'decay',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `decay: ${formatSeconds(value)}`,
    valueFormatter: formatSeconds,
    type: 'numeric',
    defaultValue: 0,
    min: 0,
    max: 1,
    step: 0.05,
    showDial: true,
  },
  {
    actionMessage: {
      parameter: 'sustain',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `sustain: ${formatPercentage(value)}`,
    valueFormatter: formatPercentage,
    type: 'numeric',
    defaultValue: 1,
    min: 0,
    max: 1,
    step: 0.05,
    showDial: true,
  },
  {
    actionMessage: {
      parameter: 'release',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `release: ${formatSeconds(value)}`,
    valueFormatter: formatSeconds,
    type: 'numeric',
    defaultValue: 0,
    min: 0,
    max: 1,
    step: 0.05,
    showDial: true,
  },
];
