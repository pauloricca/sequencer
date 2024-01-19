import { Icon, InputGroup } from "@blueprintjs/core";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { StateSequence } from "src/state/state.types";
import { InstrumentConfigSelectItem } from "./InstrumentConfigSelect/InstrumentConfigSelect.types";
import { InstrumentConfigSelect } from "./InstrumentConfigSelect/InstrumentConfigSelect";
import { useSequencersState } from "../../state/state";
import { getMidiOutputDeviceNames } from "../../utils/midi";
import { InstrumentConfigKnob } from "./InstrumentConfigKnob/InstrumentConfigKnob";
import classNames from "classnames";
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
    <div
      className={classNames("instrument-config", {
        "instrument-config--is-open": isOpen,
      })}
    >
      <div
        className="instrument-config__header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="instrument-config__instrument-name">{sequence.name}</p>
        {isOpen && <Icon icon="cross" />}
        {!isOpen && <Icon icon="cog" />}
      </div>
      {isOpen && (
        <div className="instrument-config__controls">
          <InputGroup
            value={sequence.name}
            onValueChange={(value) => updateSequence({ name: value })}
          />
          <InstrumentConfigSelect
            label={sequence.midiOutDeviceName || "midi out"}
            items={midiOutOptions}
            onSelect={({ value }) =>
              updateSequence({ midiOutDeviceName: value })
            }
          />
          <InstrumentConfigKnob
            label={`n steps: ${sequence.nSteps}`}
            value={sequence.nSteps}
            min={1}
            max={64}
            isIntegerOnly={true}
            onChange={(value) => updateSequence({ nSteps: value })}
          />
          <InstrumentConfigKnob
            label={`step length: ${sequence.stepLength}`}
            value={sequence.stepLength}
            min={1}
            max={32}
            isIntegerOnly={true}
            onChange={(value) => updateSequence({ stepLength: value })}
          />
          {children}
        </div>
      )}
    </div>
  );
};
