import React, {
  MouseEventHandler,
  TouchEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SelectKnobItem, SelectKnobProps } from './SelectKnob.types';
import { Modal } from 'components/Modal/Modal';
import { Button } from 'components/Button/Button';
import { throttle } from 'lodash';
import { MOUSE_MOVE_THROTTLE } from './SelectKnob.constants';
import { countDecimalPlaces } from 'utils/countDecimalPlaces';
import { useSequencersState } from 'state/state';
import { PRESS_AND_HOLD_TIME } from 'components/ShortcutController/ShortcutController.constants';
import classNames from 'classnames';
import { getInteractionCoords } from 'utils/touch.utils';
require('./_SelectKnob.scss');

export const SelectKnob: React.FC<SelectKnobProps> = ({
  type,
  value,
  valueFormatter = (value) => value,
  items: itemsProp = [],
  isItemsHierarchical,
  label,
  min: minProp = 0,
  max: maxProp = 1,
  step = 1,
  speed = 1,
  showDial = false,
  clickOnModalButtonClosesModal = false,
  onChange,
  actionMessage,
  modalColumns = 10,
  modalDepth,
}) => {
  const isDragging = useRef(false);
  const [isListeningForShortcut, setIsListeningForShortcut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [_, setTriggerRender] = useState(false);
  const performAction = useSequencersState((state) => state.performAction);
  const startListeningToNewShortcut = useSequencersState((state) => state.startEditingShortcut);
  const [currentPath, setCurrentPath] = useState(
    value?.substring?.(0, value.lastIndexOf?.('/') + 1)
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
                label: valueFormatter(value),
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

  const onMouseDownHandler = (ev: MouseEvent | TouchEvent) => {
    let { x: lastMouseX, y: lastMouseY } = getInteractionCoords(ev);

    const pressAndHoldCounterTimeout = actionMessage
      ? setTimeout(() => {
          removeAllEventListeners();
          setIsListeningForShortcut(true);
          startListeningToNewShortcut({
            actionMessage: actionMessage,
            valueRangeMin: min,
            valueRangeMax: max,
            originalValueRangeMin: min,
            originalValueRangeMax: max,
            decimalPlaces: stepDecimalPlaces,
          });
        }, PRESS_AND_HOLD_TIME)
      : -1;

    const mouseMoveHandler = throttle((ev: MouseEvent | TouchEvent) => {
      ev.preventDefault();

      clearInterval(pressAndHoldCounterTimeout);
      const { x, y } = getInteractionCoords(ev);

      isDragging.current = true;

      const mouseDif = (lastMouseY - y + x - lastMouseX) * speed;
      const movementAmount = (mouseDif * step) / 10;

      if (Math.abs(movementAmount) >= step) {
        lastMouseX = x;
        lastMouseY = y;

        let currentValueOrIndex: number = 0;

        if (type === 'numeric') {
          currentValueOrIndex = valueRef.current as number;
        } else {
          currentValueOrIndex = items.findIndex(({ value }) => value === valueRef.current);

          // If current value is not found, then we assume index 0
          if (currentValueOrIndex < 0) currentValueOrIndex = 0;
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

      return false;
    }, MOUSE_MOVE_THROTTLE);

    const mouseUpHandler = () => {
      clearInterval(pressAndHoldCounterTimeout);

      // Delay setting isDragging to false so that we can avoid triggering the onClick handler
      setTimeout(() => {
        isDragging.current = false;
        setIsListeningForShortcut(false);
        setTriggerRender((prev) => !prev);
      }, 100);

      removeAllEventListeners();
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('touchmove', mouseMoveHandler, { passive: false });
    window.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('touchend', mouseUpHandler);
    window.addEventListener('touchcancel', mouseUpHandler);

    const removeAllEventListeners = () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('touchmove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      window.removeEventListener('touchend', mouseUpHandler);
      window.removeEventListener('touchcancel', mouseUpHandler);
    };
  };

  const goToParentPath = () =>
    setCurrentPath(
      currentPath.substring(
        0,
        currentPath.substring(0, currentPath.length - 1).lastIndexOf('/') + 1
      )
    );

  const getDirectoryItemsInPath = () => {
    const directoriesInPath: string[] = [];
    const fileItemsInPath: SelectKnobItem[] = [];

    items.forEach((item) => {
      const path = item.value as string;

      if (path.startsWith(currentPath)) {
        const relPath = path.substring(currentPath.length);

        if (relPath.indexOf('/') < 0) {
          fileItemsInPath.push(item);
        } else {
          const dirName = relPath.substring(0, relPath.indexOf('/'));

          if (!directoriesInPath.includes(dirName)) directoriesInPath.push(dirName);
        }
      }
    });

    return (
      <>
        {directoriesInPath.map((dirName) => (
          <Button
            onClick={() => setCurrentPath(`${currentPath}${dirName}/`)}
            icon="folder-close"
            isIconOnTheLeft
            key={dirName}
          >
            {dirName}
          </Button>
        ))}
        {fileItemsInPath.map((item) =>
          getItemModalButton(item, item.value.substring(item.value.lastIndexOf('/') + 1))
        )}
      </>
    );
  };

  const getItemModalButton = (item: SelectKnobItem, label?: string) => (
    <Button
      onClick={() => {
        clickOnModalButtonClosesModal && setIsOpen(false);
        !actionMessage && setNewValue(item.value, item);
        !!actionMessage && onChange && onChange(item.value, item);
      }}
      actionMessage={actionMessage ? { ...actionMessage, value: item.value } : undefined}
      actionMessageDecimalPlaces={stepDecimalPlaces}
      key={item.key ?? item.label ?? item.value}
      isActive={item.value === value}
    >
      {label ?? item.label ?? item.value}
    </Button>
  );

  return (
    <>
      <div
        className="select-knob draggable"
        onMouseDown={onMouseDownHandler as any as MouseEventHandler}
        onTouchStart={onMouseDownHandler as any as TouchEventHandler}
      >
        <Button
          onClick={() => !isDragging.current && !isListeningForShortcut && setIsOpen(true)}
          isActive={isDragging.current || isListeningForShortcut}
          icon={
            type === 'discrete'
              ? value === items[0]?.value
                ? 'caret-right'
                : value === items[items.length - 1]?.value
                  ? 'caret-left'
                  : 'double-caret-horizontal'
              : undefined
          }
        >
          {label}
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
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} depth={modalDepth}>
        {isOpen && (
          <div
            className={classNames(
              'select-knob__modal-contents',
              `select-knob__modal-contents--${modalColumns}-columns`
            )}
          >
            {!isItemsHierarchical && items.map((item) => getItemModalButton(item))}
            {isItemsHierarchical && (
              <>
                {currentPath !== '' && (
                  <Button onClick={goToParentPath} icon="arrow-left" isIconOnTheLeft>
                    back
                  </Button>
                )}
                {getDirectoryItemsInPath()}
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};
