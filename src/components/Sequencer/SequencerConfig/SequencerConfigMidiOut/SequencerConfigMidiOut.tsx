import React from 'react';
import { useSequencersState } from 'state/state';
import { SelectKnobMidi } from 'components/SelectKnob/SelectKnobMidi/SelectKnobMidi';

export interface SequencerConfigMidiOutProps {
  sequenceName: string;
}

export const SequencerConfigMidiOut: React.FC<SequencerConfigMidiOutProps> = ({ sequenceName }) => {
  const midiOutDeviceName = useSequencersState(
    (state) => state.sequences.find(({ name }) => name === sequenceName)?.midiOutDeviceName
  );
  const updateSequence = useSequencersState((state) => state.updateSequence);

  return (
    <SelectKnobMidi
      type="output"
      value={midiOutDeviceName}
      onChange={(value) => updateSequence(sequenceName, { midiOutDeviceName: value })}
    />
  );
};
