import React, { useEffect, useState } from 'react';
import { StateSequence } from 'state/state.types';
import { useSequencersState } from 'state/state';
import { getMidiOutputDeviceNames } from 'utils/midi';
import { SelectKnob } from '../../../SelectKnob/SelectKnob';
import { SelectKnobItem } from '../../../SelectKnob/SelectKnob.types';

export interface SequencerConfigMidiOutProps {
  sequence: StateSequence;
}

export const SequencerConfigMidiOut: React.FC<SequencerConfigMidiOutProps> = ({ sequence }) => {
  const updateSequence = useSequencersState((state) => state.updateSequence);
  const [midiOutOptions, setMidiOutOptions] = useState<SelectKnobItem[]>([]);

  const getMidiOutOptions = () => [
    { label: 'none', value: undefined },
    ...getMidiOutputDeviceNames().map((name) => ({ value: name })),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMidiOutOptions(getMidiOutOptions());
    }, 5000);

    setMidiOutOptions(getMidiOutOptions());

    return () => clearInterval(interval);
  }, []);

  return (
    <SelectKnob
      label={sequence.midiOutDeviceName || 'midi out'}
      type="discrete"
      items={midiOutOptions}
      onChange={(value) => updateSequence(sequence.name, { midiOutDeviceName: value })}
      value={sequence.midiOutDeviceName}
    />
  );
};
