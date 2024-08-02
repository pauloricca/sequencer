import classnames from 'classnames';
import { throttle } from 'lodash';
import React, { MouseEventHandler, TouchEventHandler, memo, useEffect, useState } from 'react';
import { StateSequenceStep } from 'state/state.types';
import { isTouchDevice } from 'utils/isTouchDevice';
import { getInteractionCoords, lockPageScroll, unlockPageScroll } from 'utils/touch.utils';
require('./_SequencerChannelStep.scss');

const MOUSE_DRAG_RANGE = 50;
const MOUSE_MOUSE_THROTTLE = 150;

export interface SequencerChannelStepProps {
  stepIndex: number;
  step: StateSequenceStep | undefined;
  isActive: boolean;
  onToggle: (stepIndex: number, currentStep?: StateSequenceStep) => void;
  onDragStart: () => void;
  isDraggingAlongChannel: boolean;
  stepPropertyEditDirection: 'horizontal' | 'vertical';
  /**
   * 0 - 1 value for the step height property fill. this can be used for velocity and other parameters.
   */
  isControllingFillPercentage?: boolean;
  fillPercentage?: number;
  fillPercentageMax?: number;
  onFillPercentageChange?: (fillPercentage: number, step?: StateSequenceStep) => void;
}

export const SequencerChannelStep: React.FC<SequencerChannelStepProps> = memo(
  ({
    stepIndex,
    step,
    isActive,
    onToggle,
    onDragStart,
    isDraggingAlongChannel,
    isControllingFillPercentage = false,
    fillPercentage = 1,
    fillPercentageMax = 1,
    onFillPercentageChange = () => {},
    stepPropertyEditDirection,
  }) => {
    const [internalFillValue, setInternalFillValue] = useState(fillPercentage);

    const isToggled = !!step;

    useEffect(() => setInternalFillValue(fillPercentage), [fillPercentage]);

    useEffect(() => {
      if (
        isControllingFillPercentage &&
        fillPercentage !== internalFillValue &&
        internalFillValue !== undefined
      ) {
        onFillPercentageChange(internalFillValue, step);
      }
    }, [internalFillValue]);

    const onMouseDownHandler = (ev: MouseEvent | TouchEvent) => {
      const { x, y } = getInteractionCoords(ev);

      if (!isControllingFillPercentage) {
        onToggle(stepIndex, step);
        onDragStart();
      } else {
        lockPageScroll();

        let lastMouseX = x;
        let lastMouseY = y;
        let mouseHasMoved = false;

        const mouseMoveHandler = throttle((ev: MouseEvent | TouchEvent) => {
          ev.preventDefault();

          const { x, y } = getInteractionCoords(ev);
          const mouseYDif = lastMouseY - y + x - lastMouseX;

          lastMouseX = x;
          lastMouseY = y;
          setInternalFillValue((prevValue) =>
            Math.max(0, Math.min(fillPercentageMax, prevValue + mouseYDif / MOUSE_DRAG_RANGE))
          );
          mouseHasMoved = true;
        }, MOUSE_MOUSE_THROTTLE);
        const mouseUpHandler = () => {
          unlockPageScroll();
          window.removeEventListener('mousemove', mouseMoveHandler);
          window.removeEventListener('touchmove', mouseMoveHandler);
          window.removeEventListener('mouseup', mouseUpHandler);
          window.removeEventListener('touchend', mouseUpHandler);
          window.removeEventListener('touchcancel', mouseUpHandler);
          if (!mouseHasMoved) {
            onToggle(stepIndex, step);
          }
        };

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('touchmove', mouseMoveHandler, { passive: false });
        window.addEventListener('mouseup', mouseUpHandler);
        window.addEventListener('touchend', mouseUpHandler);
        window.addEventListener('touchcancel', mouseUpHandler);
      }
    };

    const onMouseEnterHandler = () => {
      if (!isControllingFillPercentage && isDraggingAlongChannel) {
        onToggle(stepIndex, step);
      }
    };

    return (
      <div
        className={classnames('sequencer-channel-step', {
          'sequencer-channel-step--is-toggled': isToggled,
          'sequencer-channel-step--is-active': isActive,
        })}
        onMouseDown={
          !isTouchDevice() ? (onMouseDownHandler as any as MouseEventHandler) : undefined
        }
        onTouchStart={onMouseDownHandler as any as TouchEventHandler}
        onMouseEnter={onMouseEnterHandler}
      >
        <div
          className="sequencer-channel-step__fill"
          style={
            stepPropertyEditDirection === 'vertical'
              ? { height: `${fillPercentage * 100}%` }
              : { width: `${fillPercentage * 100}%` }
          }
        />
      </div>
    );
  }
);

SequencerChannelStep.displayName = 'SequencerChannelStep';
