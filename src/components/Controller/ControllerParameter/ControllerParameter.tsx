import React from 'react';
import { useSequencersState } from 'state/state';
import { SelectKnobProps } from 'components/SelectKnob/SelectKnob.types';
import { StateActionMessage, StateSequence } from 'state/state.types';
import { SelectKnob } from 'components/SelectKnob/SelectKnob';

export interface ControllerParameterProps
  extends Omit<SelectKnobProps, 'label' | 'value' | 'onChange' | 'actionMessage'> {
  actionMessage: StateActionMessage;
  labelCallback: (value: any) => string;
}

export const ControllerParameter: React.FC<ControllerParameterProps> = ({
  actionMessage,
  labelCallback,
  ...selectKnobProps
}) => {
  const value = useSequencersState((state) => {
    if (actionMessage.type === 'Sequence Param Change') {
      const sequence = state.sequences.find(({ name }) => name === actionMessage.sequenceName);

      if (!sequence) return undefined;
      return sequence[actionMessage.parameter as keyof StateSequence];
    }
    return undefined;
  });

  return (
    <SelectKnob
      actionMessage={actionMessage}
      value={value}
      label={labelCallback(value)}
      {...selectKnobProps}
    />
  );
};
