import React, { MouseEventHandler, useEffect, useMemo, useState } from 'react';
import { InstrumentConfigSelectKnobProps } from './InstrumentConfigSelectKnob.types';
import { Icon } from '@blueprintjs/core';
import { Modal } from 'components/Modal/Modal';
import { Button } from 'components/Button/Button';
import { throttle } from 'lodash';
import { MOUSE_MOUSE_THROTTLE } from './InstrumentConfigSelectKnob.constants';
import classNames from 'classnames';
require('./_InstrumentConfigSelectKnob.scss');

export const InstrumentConfigSelectKnob: React.FC<InstrumentConfigSelectKnobProps> = ({
  type,
  value,
  items: itemsProp = [],
  label,
  min: minProp = 0,
  max: maxProp = 1,
  step = 1,
  speed = 1,
  showDial = false,
  clickOnModalButtonClosesModal = false,
  onChange,
}) => {
  // internalNumericValue holds the numeric value or the index of discrete items
  const [internalNumericValue, setInternalNumericValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const items =
    useMemo<InstrumentConfigSelectKnobProps['items']>(
      () =>
        type === 'discrete'
          ? itemsProp
          : [...Array((maxProp - minProp) / step).keys()].map((value) => ({
              value: value * step,
              key: value * step,
              label: `${value * step}`,
            })),
      [itemsProp, minProp, maxProp]
    ) ?? [];
  const min = type === 'numeric' ? minProp : 0;
  const max = type === 'numeric' ? maxProp : items?.length;

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

      const mouseDif = (lastMouseY - ev.screenY + ev.screenX - lastMouseX) * speed;

      if (Math.abs(mouseDif) >= step) {
        lastMouseX = ev.screenX;
        lastMouseY = ev.screenY;

        setInternalNumericValue((prevValue) =>
          Math.max(min, Math.min(max, mouseDif < 0 ? prevValue - step : prevValue + step))
        );
      }
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
                  : internalNumericValue < max - 1
                    ? 'double-caret-vertical'
                    : 'caret-down'
              }
            />
          )}
          {type === 'numeric' && showDial && (
            <div className="instrument-config-select-knob__dial-outer">
              <div
                className="instrument-config-select-knob__dial"
                style={{ height: `${((value - min) / (max - min)) * 100}%` }}
              />
            </div>
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
