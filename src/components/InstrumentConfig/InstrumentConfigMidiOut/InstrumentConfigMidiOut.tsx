import React, { useEffect, useState } from "react";
import { StateSequence } from "src/state/state.types";
import { InstrumentConfigSelectItem } from "../InstrumentConfigSelect/InstrumentConfigSelect.types";
import { InstrumentConfigSelect } from "../InstrumentConfigSelect/InstrumentConfigSelect";
import { useSequencersState } from "../../../state/state";
import { getMidiOutputDeviceNames } from "../../../utils/midi";

export interface InstrumentConfigMidiOutProps {
  sequence: StateSequence;
}

export const InstrumentConfigMidiOut: React.FC<InstrumentConfigMidiOutProps> = ({ sequence }) => {
  const updateSequence = useSequencersState((state) =>
    state.updateSequence(sequence.name)
  );
  const [midiOutOptions, setMidiOutOptions] = useState<
    InstrumentConfigSelectItem[]
  >([]);

  const getMidiOutOptions = () => [
    { label: "none", value: undefined },
    ...getMidiOutputDeviceNames().map((name) => ({ value: name })),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMidiOutOptions(getMidiOutOptions());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <InstrumentConfigSelect
      label={sequence.midiOutDeviceName || "midi out"}
      items={midiOutOptions}
      onSelect={({ value }) => updateSequence({ midiOutDeviceName: value })}
    />
  );
};
