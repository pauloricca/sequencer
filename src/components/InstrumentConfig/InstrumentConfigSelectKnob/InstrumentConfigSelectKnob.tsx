import React, { MouseEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import { InstrumentConfigSelectKnobProps } from './InstrumentConfigSelectKnob.types';
import { Icon } from '@blueprintjs/core';
import { Modal } from 'components/Modal/Modal';
import { Button } from 'components/Button/Button';
import { throttle } from 'lodash';
import { MOUSE_MOUSE_THROTTLE } from './InstrumentConfigSelectKnob.constants';
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
  const isDragging = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [_, setTriggerRender] = useState(false);

  // Keep a copy of the value prop in ref to be accessible inside event handlers
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const items =
    useMemo<InstrumentConfigSelectKnobProps['items']>(
      () =>
        type === 'discrete'
          ? itemsProp
          : [...Array(1 + (maxProp - minProp) / step).keys()].map((value) => ({
              value: minProp + value * step,
              key: minProp + value * step,
              label: `${minProp + value * step}`,
            })),
      [itemsProp, minProp, maxProp]
    ) ?? [];
  const min = type === 'numeric' ? minProp : 0;
  const max = type === 'numeric' ? maxProp : items?.length - 1;

  const onMouseDownHandler: MouseEventHandler = (ev) => {
    let lastMouseX = ev.screenX;
    let lastMouseY = ev.screenY;

    const mouseMoveHandler = throttle((ev: MouseEvent) => {
      isDragging.current = true;

      const mouseDif = (lastMouseY - ev.screenY + ev.screenX - lastMouseX) * speed;

      if (Math.abs(mouseDif) >= step) {
        lastMouseX = ev.screenX;
        lastMouseY = ev.screenY;

        let currentValueOrIndex: number = 0;

        if (type === 'numeric') {
          currentValueOrIndex = valueRef.current as number;
        } else {
          currentValueOrIndex = items.findIndex(({ value }) => value === valueRef.current);
          if (currentValueOrIndex < 0) return;
        }

        const newValue = Math.max(
          min,
          Math.min(max, mouseDif < 0 ? currentValueOrIndex - step : currentValueOrIndex + step)
        );

        if (type === 'numeric' && newValue !== valueRef.current) {
          onChange(newValue);
        } else if (type === 'discrete' && items[newValue]?.value !== valueRef.current) {
          onChange(items[newValue]?.value, items[newValue]);
        }
      }
    }, MOUSE_MOUSE_THROTTLE);
    const mouseUpHandler = () => {
      // Delay setting isDragging to false so that we can avoid triggering the onClick handler
      setTimeout(() => {
        isDragging.current = false;
        setTriggerRender((prev) => !prev);
      }, 100);
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  };

  return (
    <>
      <div className="instrument-config-select-knob" onMouseDown={onMouseDownHandler}>
        <Button
          onClick={() => !isDragging.current && setIsOpen(true)}
          isActive={isDragging.current}
        >
          {label}
          {type === 'discrete' && (
            <Icon
              icon={
                value === items[0]?.value
                  ? 'caret-up'
                  : value === items[items.length - 1]?.value
                    ? 'caret-down'
                    : 'double-caret-vertical'
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
