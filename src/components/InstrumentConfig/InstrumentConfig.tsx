import { Icon } from "@blueprintjs/core";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { StateSequence } from "src/state/state.types";
import { InstrumentConfigSelectItem } from "./InstrumentConfigSelect/InstrumentConfigSelect.types";
import { InstrumentConfigSelect } from "./InstrumentConfigSelect/InstrumentConfigSelect";
import { useSequencersState } from "../../state/state";
import { getMidiOutputDeviceNames } from "../../utils/midi";
require("./_InstrumentConfig.scss");

interface InstrumentConfigProps {
  sequence: StateSequence;
  children?: ReactNode;
}

export const InstrumentConfig: React.FC<InstrumentConfigProps> = ({
  sequence,
  children,
}) => {
  const updateSequence = useSequencersState((state) =>
    state.updateSequence(sequence.name)
  );
  const [isOpen, setIsOpen] = useState(false);
  const nStepsOptions = useRef<InstrumentConfigSelectItem[]>(
    [...Array(64).keys()].map((key) => ({
      key: key + 1,
      label: `${key + 1}`,
      value: key + 1,
    }))
  );
  const stepLengthOptions = useRef<InstrumentConfigSelectItem[]>(
    [...Array(32).keys()].map((key) => ({
      key: key + 1,
      label: `${key + 1}`,
      value: key + 1,
    }))
  );
  const [midiOutOptions, setMidiOutOptions] = useState<InstrumentConfigSelectItem[]>([]);

  const getMidiOutOptions = useCallback(() => [
    {
      key: 0,
      label: "none",
      value: undefined,
    },
    ...getMidiOutputDeviceNames().map((name) => ({
      key: name,
      label: name,
      value: name,
    })),
  ], []);

  useEffect(() => {
    setInterval(() => {
      setMidiOutOptions(getMidiOutOptions())
    }, 2000);
  }, []);

  return (
    <div className="instrument-config">
      <div
        className="instrument-config__header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="instrument__name">{sequence.name}</p>
        {isOpen && <Icon icon="cross" />}
        {!isOpen && <Icon icon="cog" />}
      </div>
      {isOpen && (
        <div className="instrument-config__controls">
          <InstrumentConfigSelect
            label={`n steps: ${sequence.nSteps}`}
            items={nStepsOptions.current}
            onSelect={({ value }) => updateSequence({ nSteps: value })}
          />
          <InstrumentConfigSelect
            label={`step length: ${sequence.stepLength}`}
            items={stepLengthOptions.current}
            onSelect={({ value }) => updateSequence({ stepLength: value })}
          />
          <InstrumentConfigSelect
            label={sequence.midiOutDeviceName || "midi out"}
            items={midiOutOptions}
            onSelect={({ value }) =>
              updateSequence({ midiOutDeviceName: value })
            }
          />
          {children}
        </div>
      )}
    </div>
  );
};
