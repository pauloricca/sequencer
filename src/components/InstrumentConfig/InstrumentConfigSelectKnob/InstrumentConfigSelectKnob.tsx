import React, { MouseEventHandler, useEffect, useState } from 'react';
import { InstrumentConfigSelectKnobProps } from './InstrumentConfigSelectKnob.types';
import { Icon } from '@blueprintjs/core';
import { Modal } from 'components/Modal/Modal';
import { Button } from 'components/Button/Button';
import { throttle } from 'lodash';
import {
  MOUSE_DRAG_RANGE_SPEEDS,
  MOUSE_MOUSE_THROTTLE,
} from './InstrumentConfigSelectKnob.constants';
import classNames from 'classnames';
require('./_InstrumentConfigSelectKnob.scss');

export const InstrumentConfigSelectKnob: React.FC<InstrumentConfigSelectKnobProps> = ({
  type,
  value,
  items = [],
  label,
  min: minProp = 0,
  max: maxProp = 1,
  step = 1,
  speed = 'normal',
  clickOnModalButtonClosesModal = false,
  onChange,
}) => {
  // internalNumericValue holds the numeric value or the index of discrete items
  const [internalNumericValue, setInternalNumericValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const min = type === 'numeric' ? minProp : 0;
  const max = type === 'numeric' ? maxProp : items?.length;

  console.log(internalNumericValue);

  useEffect(() => {
    const newInternalNumericValue =
      type === 'numeric' ? (value as number) : items.findIndex((item) => item.value === value) ?? 0;

    if (newInternalNumericValue !== internalNumericValue) {
      setInternalNumericValue(newInternalNumericValue);
    }
  }, [value]);

  useEffect(() => {
    const newExternalValue =
      type === 'numeric'
        ? internalNumericValue
        : items[Math.min(internalNumericValue, items.length - 1)]?.value;

    if (value !== newExternalValue && newExternalValue !== undefined) {
      onChange(newExternalValue, items[Math.min(internalNumericValue, items.length - 1)]);
    }
  }, [internalNumericValue]);

  const onMouseDownHandler: MouseEventHandler = (ev) => {
    let lastMouseX = ev.screenX;
    let lastMouseY = ev.screenY;

    const mouseMoveHandler = throttle((ev: MouseEvent) => {
      setIsDragging(true);

      const mouseYDif = lastMouseY - ev.screenY + ev.screenX - lastMouseX;

      lastMouseX = ev.screenX;
      lastMouseY = ev.screenY;

      setInternalNumericValue((prevValue) => {
        const newInternalNumericValue = Math.max(
          min,
          Math.min(max, prevValue + ((max - min) * mouseYDif) / MOUSE_DRAG_RANGE_SPEEDS[speed])
        );

        return type === 'discrete' ? Math.round(newInternalNumericValue) : newInternalNumericValue;
      });
    }, MOUSE_MOUSE_THROTTLE);
    const mouseUpHandler = () => {
      // Delay setting isDragging to false so that we can avoid triggering the onClick handler
      setTimeout(() => setIsDragging(false), 100);
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  };

  return (
    <>
      <div
        className={classNames('instrument-config-select-knob', {
          'instrument-config-select-knob--is-dragging': isDragging,
        })}
        onMouseDown={onMouseDownHandler}
      >
        <Button onClick={() => !isDragging && setIsOpen(true)} isActive={isDragging}>
          {label}
          {type === 'discrete' && (
            <Icon
              icon={
                internalNumericValue === 0
                  ? 'caret-up'
                  : internalNumericValue < max
                    ? 'double-caret-vertical'
                    : 'caret-down'
              }
            />
          )}
        </Button>
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="instrument-config-select-knob__modal-contents">
          {items.map((item) => (
            <Button
              onClick={() => {
                clickOnModalButtonClosesModal && setIsOpen(false);
                onChange(item.value, item);
              }}
              key={item.key ?? item.label ?? item.value}
              isActive={item.value === value}
            >
              {item.label ?? item.value}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
};
