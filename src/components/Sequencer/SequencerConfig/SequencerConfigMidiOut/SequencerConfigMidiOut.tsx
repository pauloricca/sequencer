import React from 'react';
import { useSequencersState } from 'state/state';
import { SelectKnobMidi } from 'components/SelectKnob/SelectKnobMidi/SelectKnobMidi';

export interface SequencerConfigMidiOutProps {
  sequenceId: string;
}

export const SequencerConfigMidiOut: React.FC<SequencerConfigMidiOutProps> = ({ sequenceId }) => {
  const midiOutDeviceName = useSequencersState(
    (state) => state.sequences.find(({ id }) => id === sequenceId)?.midiOutDeviceName
  );
  const updateSequence = useSequencersState((state) => state.updateSequence);

  return (
    <SelectKnobMidi
      type="output"
      value={midiOutDeviceName}
      onChange={(value) => updateSequence(sequenceId, { midiOutDeviceName: value })}
    />
  );
};
