import React, { useEffect, useState } from 'react';
import { MidiType, useMidiDeviceNames } from 'utils/midi';
import { SelectKnobItem } from '../SelectKnob.types';
import { SelectKnob } from '../SelectKnob';

export interface SelectKnobMidiProps {
  type: MidiType;
  onChange: (deviceName: string) => void;
  value?: string;
  modalDepth?: number;
}

export const SelectKnobMidi: React.FC<SelectKnobMidiProps> = ({
  type,
  onChange,
  value,
  modalDepth,
}) => {
  const midiDeviceNames = useMidiDeviceNames(type);
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
      label={value ?? `- midi ${type} -`}
      type="discrete"
      items={midiOutOptions}
      onChange={onChange}
      value={value}
      modalColumns={3}
      clickOnModalButtonClosesModal
      modalDepth={modalDepth}
    />
  );
};
