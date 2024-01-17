import { Spinner } from "@blueprintjs/core";
import classNames from "classnames";
import React, { useEffect, useState } from "react";

interface InstrumentConfigKnobProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  isIntegerOnly?: boolean;
  isTransparent?: boolean;
}

export const InstrumentConfigKnob: React.FC<InstrumentConfigKnobProps> = ({
  value,
  onChange,
  min = 0,
  max = 1,
  isIntegerOnly = false,
  isTransparent = false,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => setInternalValue(value), [value]);

  useEffect(() => {
    if (value !== internalValue) {
      onChange(internalValue);
    }
  }, [internalValue]);

  const onMouseDownHandler = () => {
    setIsDragging(true);
    const mouseUpHandler = () => {
      setIsDragging(false);
      document.body.removeEventListener("mouseup", mouseUpHandler);
    };
    document.body.addEventListener("mouseup", mouseUpHandler);
  };

  return (
    <div
      className={classNames("instrument-config-knob", {
        "instrument-config-knob--is-transparent": isTransparent,
       })}
      onMouseDown={onMouseDownHandler}
    >
      <Spinner
        value={(value - min) / (max - min)}
        intent={isDragging ? "primary" : undefined}
      />
    </div>
  );
};
