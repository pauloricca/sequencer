import React, { MouseEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import { SelectKnobProps } from './SelectKnob.types';
import { Icon } from '@blueprintjs/core';
import { Modal } from 'components/Modal/Modal';
import { Button } from 'components/Button/Button';
import { throttle } from 'lodash';
import { MOUSE_MOVE_THROTTLE } from './SelectKnob.constants';
import { countDecimalPlaces } from 'utils/countDecimalPlaces';
import { useSequencersState } from 'state/state';
import { PRESS_AND_HOLD_TIME } from 'components/ShortcutController/ShortcutController.constants';
require('./_SelectKnob.scss');

export const SelectKnob: React.FC<SelectKnobProps> = ({
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
  actionMessage,
}) => {
  const isDragging = useRef(false);
  const [isListeningForShortcut, setIsListeningForShortcut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [_, setTriggerRender] = useState(false);
  const performAction = useSequencersState((state) => state.performAction);
  const stopListeningToNewShortcut = useSequencersState(
    (state) => state.stopListeningToNewShortcut
  );
  const startListeningToNewShortcut = useSequencersState(
    (state) => state.startListeningToNewShortcut
  );

  // Keep a copy of the value prop in ref to be accessible inside event handlers
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const stepDecimalPlaces = countDecimalPlaces(step);
  const items =
    useMemo<SelectKnobProps['items']>(
      () =>
        type === 'discrete'
          ? itemsProp
          : [...Array(Math.round(1 + (maxProp - minProp) / step)).keys()].map((valueIndex) => {
              // Prevent odd rounding errors
              const value = (minProp + valueIndex * step).toFixed(stepDecimalPlaces);

              return {
                value: Number(value),
                key: value,
                label: `${value}`,
              };
            }),
      [itemsProp, minProp, maxProp]
    ) ?? [];

  const min = type === 'numeric' ? minProp : 0;
  const max = type === 'numeric' ? maxProp : items?.length - 1;

  const setNewValue: SelectKnobProps['onChange'] = (value, item) => {
    onChange && onChange(value, item);

    actionMessage &&
      performAction({
        ...actionMessage,
        value,
      });
  };

  const onMouseDownHandler: MouseEventHandler = (ev) => {
    let lastMouseX = ev.screenX;
    let lastMouseY = ev.screenY;

    const pressAndHoldCounterTimeout = actionMessage
      ? setTimeout(() => {
          window.removeEventListener('mousemove', mouseMoveHandler);
          setIsListeningForShortcut(true);
          startListeningToNewShortcut({
            actionMessage: actionMessage,
            valueRangeMin: min,
            valueRangeMax: max,
            decimalPlaces: stepDecimalPlaces,
          });
        }, PRESS_AND_HOLD_TIME)
      : -1;

    const mouseMoveHandler = throttle((ev: MouseEvent) => {
      clearInterval(pressAndHoldCounterTimeout);

      isDragging.current = true;

      const mouseDif = (lastMouseY - ev.screenY + ev.screenX - lastMouseX) * speed;
      const movementAmount = (mouseDif * step) / 10;

      if (Math.abs(movementAmount) >= step) {
        lastMouseX = ev.screenX;
        lastMouseY = ev.screenY;

        let currentValueOrIndex: number = 0;

        if (type === 'numeric') {
          currentValueOrIndex = valueRef.current as number;
        } else {
          currentValueOrIndex = items.findIndex(({ value }) => value === valueRef.current);
          if (currentValueOrIndex < 0) return;
        }

        const decimalPlacesMultiplier = stepDecimalPlaces > 0 ? stepDecimalPlaces * 10 : 1;
        const numberOfStepsToAdvance =
          Math.floor((Math.abs(movementAmount) / step) * decimalPlacesMultiplier) /
          decimalPlacesMultiplier;

        let newValue = Math.max(
          min,
          Math.min(
            max,
            movementAmount < 0
              ? currentValueOrIndex - step * numberOfStepsToAdvance
              : currentValueOrIndex + step * numberOfStepsToAdvance
          )
        );

        // Prevent odd rounding errors
        if (stepDecimalPlaces > 0) {
          newValue = Number(newValue.toFixed(stepDecimalPlaces));
        }

        if (type === 'numeric' && newValue !== valueRef.current) {
          setNewValue(newValue);
        } else if (type === 'discrete' && items[newValue]?.value !== valueRef.current) {
          setNewValue(items[newValue]?.value, items[newValue]);
        }
      }
    }, MOUSE_MOVE_THROTTLE);

    const mouseUpHandler = () => {
      clearInterval(pressAndHoldCounterTimeout);
      stopListeningToNewShortcut();

      // Delay setting isDragging to false so that we can avoid triggering the onClick handler
      setTimeout(() => {
        isDragging.current = false;
        setIsListeningForShortcut(false);
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
      <div className="select-knob" onMouseDown={onMouseDownHandler}>
        <Button
          onClick={() => !isDragging.current && !isListeningForShortcut && setIsOpen(true)}
          isActive={isDragging.current || isListeningForShortcut}
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
            <div className="select-knob__dial">
              <div
                className="select-knob__dial-fill"
                style={{ width: `${((value - min) / (max - min)) * 100}%` }}
              />
            </div>
          )}
        </Button>
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="select-knob__modal-contents">
          {items.map((item) => (
            <Button
              onClick={() => {
                clickOnModalButtonClosesModal && setIsOpen(false);
                !actionMessage && setNewValue(item.value, item);
              }}
              actionMessage={actionMessage ? { ...actionMessage, value: item.value } : undefined}
              actionMessageDecimalPlaces={stepDecimalPlaces}
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
