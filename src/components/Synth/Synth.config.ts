import { ControllerParameterProps } from 'components/Controller/ControllerParameter/ControllerParameter';
import { Midi, ScaleType } from 'tonal';

export const getSynthConfigParameterConfig = (sequenceName: string): ControllerParameterProps[] => [
  {
    actionMessage: {
      parameter: 'midiChannel',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `midi channel: ${value}`,
    type: 'numeric',
    min: 1,
    max: 32,
  },
  {
    actionMessage: {
      parameter: 'range',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `range: ${value}`,
    type: 'numeric',
    min: 1,
    max: 32,
  },
  {
    actionMessage: {
      parameter: 'rootNote',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `root: ${Midi.midiToNoteName(value)}`,
    type: 'discrete',
    items: [...Array(101).keys()].map((note) => ({
      value: note,
      key: note,
      label: Midi.midiToNoteName(note),
    })),
  },
  {
    actionMessage: {
      parameter: 'noteDuration',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `new note duration: ${value}`,
    type: 'numeric',
    min: 0,
    max: 16,
    step: 0.1,
    speed: 5,
    showDial: true,
  },
  {
    actionMessage: {
      parameter: 'scale',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => `scale: ${value}`,
    type: 'discrete',
    items: ScaleType.all().map((scale) => ({
      value: scale.name,
      key: scale.name,
      label: scale.name,
    })),
  },
  {
    actionMessage: {
      parameter: 'isPolyphonic',
      type: 'Sequence Param Change',
      sequenceName,
    },
    labelCallback: (value) => (value ? 'polyphonic' : 'monophonic'),
    type: 'discrete',
    items: [
      {
        value: false,
        label: 'monophonic',
      },
      {
        value: true,
        label: 'polyphonic',
      },
    ],
  },
];
