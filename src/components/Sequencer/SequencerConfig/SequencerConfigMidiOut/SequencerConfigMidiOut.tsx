import React, { useEffect, useState } from 'react';
import { useSequencersState } from 'state/state';
import { SelectKnob } from '../../../SelectKnob/SelectKnob';
import { SelectKnobItem } from '../../../SelectKnob/SelectKnob.types';
import { useMidiDeviceNames } from 'utils/midi';

export interface SequencerConfigMidiOutProps {
  sequenceName: string;
}

export const SequencerConfigMidiOut: React.FC<SequencerConfigMidiOutProps> = ({ sequenceName }) => {
  const midiOutDeviceName = useSequencersState(
    (state) => state.sequences.find(({ name }) => name === sequenceName)?.midiOutDeviceName
  );
  const updateSequence = useSequencersState((state) => state.updateSequence);
  const midiDeviceNames = useMidiDeviceNames('output');
  const [midiOutOptions, setMidiOutOptions] = useState<SelectKnobItem[]>([]);

  const getMidiOutOptions = () => [
    { label: 'none', value: undefined },
    ...midiDeviceNames.map((name) => ({ value: name })),
  ];

  useEffect(() => {
    setMidiOutOptions(getMidiOutOptions());
  }, [midiDeviceNames]);

  return (
    <SelectKnob
      label={midiOutDeviceName || 'midi out'}
      type="discrete"
      items={midiOutOptions}
      onChange={(value) => updateSequence(sequenceName, { midiOutDeviceName: value })}
      value={midiOutDeviceName}
      modalColumns={3}
    />
  );
};
