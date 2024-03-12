import { Button, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';
import { throttle } from 'lodash';
import React, { MouseEventHandler, useEffect, useState } from 'react';
require('./_InstrumentConfigKnob.scss');

const MOUSE_DRAG_RANGE_NORMAL = 800;
const MOUSE_DRAG_RANGE_FAST = 50;
const MOUSE_MOUSE_THROTTLE = 150;

type InstrumentConfigKnobSpeed = 'normal' | 'fast';

const MOUSE_DRAG_RANGE_SPEEDS: { [key in InstrumentConfigKnobSpeed]: number } = {
  normal: MOUSE_DRAG_RANGE_NORMAL,
  fast: MOUSE_DRAG_RANGE_FAST,
};

interface InstrumentConfigKnobProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  isIntegerOnly?: boolean;
  isTransparent?: boolean;
  speed?: InstrumentConfigKnobSpeed;
}

export const InstrumentConfigKnob: React.FC<InstrumentConfigKnobProps> = ({
  value,
  onChange,
  label = '',
  min = 0,
  max = 1,
  isIntegerOnly = false,
  isTransparent = false,
  speed = 'normal',
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => setInternalValue(value), [value]);

  useEffect(() => {
    if (value !== internalValue && internalValue !== undefined) {
      onChange(isIntegerOnly ? Math.round(internalValue) : internalValue);
    }
  }, [internalValue]);

  const onMouseDownHandler: MouseEventHandler = (ev) => {
    let lastMouseX = ev.screenX;
    let lastMouseY = ev.screenY;

    setIsDragging(true);
    const mouseMoveHandler = throttle((ev: MouseEvent) => {
      const mouseYDif = lastMouseY - ev.screenY + ev.screenX - lastMouseX;

      lastMouseX = ev.screenX;
      lastMouseY = ev.screenY;
      setInternalValue((prevValue) =>
        Math.max(
          min,
          Math.min(max, prevValue + ((max - min) * mouseYDif) / MOUSE_DRAG_RANGE_SPEEDS[speed])
        )
      );
    }, MOUSE_MOUSE_THROTTLE);
    const mouseUpHandler = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  };

  return (
    <div
      className={classNames('instrument-config-knob', {
        'instrument-config-knob--is-transparent': isTransparent,
      })}
      onMouseDown={onMouseDownHandler}
    >
      <Button text={label} fill={true}>
        <Spinner
          value={(value - min) / (max - min)}
          intent={isDragging ? 'primary' : undefined}
          title={`${internalValue}`}
          size={18}
        />
      </Button>
    </div>
  );
};
