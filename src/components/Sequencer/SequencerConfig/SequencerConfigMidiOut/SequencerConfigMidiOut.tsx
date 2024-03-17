import React, { useEffect, useState } from 'react';
import { useSequencersState } from 'state/state';
import { getMidiOutputDeviceNames, registerMidiDevice } from 'utils/midi';
import { SelectKnob } from '../../../SelectKnob/SelectKnob';
import { SelectKnobItem } from '../../../SelectKnob/SelectKnob.types';

export interface SequencerConfigMidiOutProps {
  sequenceName: string;
}

export const SequencerConfigMidiOut: React.FC<SequencerConfigMidiOutProps> = ({ sequenceName }) => {
  const midiOutDeviceName = useSequencersState(
    (state) => state.sequences.find(({ name }) => name === sequenceName)?.midiOutDeviceName
  );
  const updateSequence = useSequencersState((state) => state.updateSequence);
  const [midiOutOptions, setMidiOutOptions] = useState<SelectKnobItem[]>([]);

  useEffect(() => {
    if (midiOutDeviceName) {
      registerMidiDevice(midiOutDeviceName, 'output');
    }
  }, [midiOutDeviceName]);

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
      label={midiOutDeviceName || 'midi out'}
      type="discrete"
      items={midiOutOptions}
      onChange={(value) => updateSequence(sequenceName, { midiOutDeviceName: value })}
      value={midiOutDeviceName}
    />
  );
};
