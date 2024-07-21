import React from 'react';
import { useSequencersState } from 'state/state';
import { SelectKnobProps } from 'components/SelectKnob/SelectKnob.types';
import { StateActionMessage, StateSequence, StateSequenceChannelConfig } from 'state/state.types';
import { SelectKnob } from 'components/SelectKnob/SelectKnob';

export interface ControllerParameterProps
  extends Omit<SelectKnobProps, 'label' | 'value' | 'actionMessage'> {
  actionMessage: StateActionMessage;
  labelCallback: (value: any) => string;
  defaultValue?: SelectKnobProps['value'];
}

export const ControllerParameter: React.FC<ControllerParameterProps> = ({
  actionMessage,
  defaultValue,
  labelCallback,
  ...selectKnobProps
}) => {
  let value = useSequencersState((state) => {
    if (actionMessage.type === 'Sequence Param Change') {
      const sequence = state.sequences.find(({ name }) => name === actionMessage.sequenceName);

      if (!sequence) return undefined;
      return sequence[actionMessage.parameter as keyof StateSequence];
    } else if (actionMessage.type === 'Channel Param Change') {
      const sequence = state.sequences.find(({ name }) => name === actionMessage.sequenceName);

      if (!sequence) return undefined;
      return sequence.channelsConfig[actionMessage.channelIndex][
        actionMessage.parameter as keyof StateSequenceChannelConfig
      ];
    }
    return undefined;
  });

  if (value === undefined) value = defaultValue;

  return (
    <SelectKnob
      actionMessage={actionMessage}
      value={value ?? 0}
      label={labelCallback(value)}
      {...selectKnobProps}
    />
  );
};
