import { Icon, InputGroup } from "@blueprintjs/core";
import React, { ReactNode, useEffect, useState } from "react";
import { StateSequence, StateSequenceStepProperties } from "src/state/state.types";
import { InstrumentConfigSelectItem } from "./InstrumentConfigSelect/InstrumentConfigSelect.types";
import { InstrumentConfigSelect } from "./InstrumentConfigSelect/InstrumentConfigSelect";
import { useSequencersState } from "../../state/state";
import { getMidiOutputDeviceNames } from "../../utils/midi";
import { InstrumentConfigKnob } from "./InstrumentConfigKnob/InstrumentConfigKnob";
import classNames from "classnames";
require("./_InstrumentConfig.scss");

interface InstrumentConfigProps {
  sequence: StateSequence;
  tools?: { name: string; value: string | null; icon: string }[];
  selectedTool?: string | null;
  onSelectTool?: (value: string | null) => void;
  children?: ReactNode;
}

export const InstrumentConfig: React.FC<InstrumentConfigProps> = ({
  sequence,
  tools,
  selectedTool,
  onSelectTool = () => {},
  children,
}) => {
  const updateSequence = useSequencersState((state) =>
    state.updateSequence(sequence.name)
  );
  const [isOpen, setIsOpen] = useState(false);
  const [midiOutOptions, setMidiOutOptions] = useState<
    InstrumentConfigSelectItem[]
  >([]);

  const getMidiOutOptions = () => [
    { label: "none", value: undefined },
    ...getMidiOutputDeviceNames().map((name) => ({ value: name })),
  ];

  useEffect(() => {
    setInterval(() => {
      setMidiOutOptions(getMidiOutOptions());
    }, 2000);
  }, []);

  return (
    <div
      className={classNames("instrument-config", {
        "instrument-config--is-open": isOpen,
      })}
    >
      <div className="instrument-config__header">
        <p className="instrument-config__instrument-name">{sequence.name}</p>
        <div className="instrument-config__tools">
          {tools?.map(({ name, value, icon }) => (
            <Icon
              icon={icon}
              key={name ?? value}
              className={classNames("instrument-config__tool", {
                "instrument-config__tool--is-active": value === selectedTool,
              })}
              onClick={() => onSelectTool(value)}
            />
          ))}
          {!sequence.isMuted && (
              <Icon
                icon="volume-up"
                className="instrument-config__tool instrument-config__tool--is-active"
                onClick={() => updateSequence({ isMuted: true })}
              />
            )}
            {sequence.isMuted && (
              <Icon
                icon="volume-off"
                className="instrument-config__tool"
                onClick={() => updateSequence({ isMuted: false })}
              />
            )}
          {isOpen && (
            <Icon
              icon="cross"
              className="instrument-config__tool instrument-config__tool--is-active"
              onClick={() => setIsOpen(false)}
            />
          )}
          {!isOpen && (
            <Icon
              icon="cog"
              className="instrument-config__tool"
              onClick={() => setIsOpen(true)}
            />
          )}
        </div>
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
