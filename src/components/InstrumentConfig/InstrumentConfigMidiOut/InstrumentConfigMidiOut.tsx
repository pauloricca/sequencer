import React, { useEffect, useState } from 'react';
import { StateSequence } from 'state/state.types';
import { useSequencersState } from 'state/state';
import { getMidiOutputDeviceNames } from 'utils/midi';
import { InstrumentConfigSelectKnob } from '../InstrumentConfigSelectKnob/InstrumentConfigSelectKnob';
import { InstrumentConfigSelectKnobItem } from '../InstrumentConfigSelectKnob/InstrumentConfigSelectKnob.types';

export interface InstrumentConfigMidiOutProps {
  sequence: StateSequence;
}

export const InstrumentConfigMidiOut: React.FC<InstrumentConfigMidiOutProps> = ({ sequence }) => {
  const updateSequence = useSequencersState((state) => state.updateSequence);
  const [midiOutOptions, setMidiOutOptions] = useState<InstrumentConfigSelectKnobItem[]>([]);

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
    <InstrumentConfigSelectKnob
      label={sequence.midiOutDeviceName || 'midi out'}
      type="discrete"
      items={midiOutOptions}
      onChange={(value) => updateSequence(sequence.name, { midiOutDeviceName: value })}
      value={sequence.midiOutDeviceName}
    />
  );
};
