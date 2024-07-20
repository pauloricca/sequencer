import classnames from 'classnames';
import { throttle } from 'lodash';
import React, { MouseEventHandler, memo, useEffect, useState } from 'react';
import { StateSequenceStep } from 'state/state.types';
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

    const onMouseDownHandler: MouseEventHandler = (ev) => {
      if (!isControllingFillPercentage) {
        onToggle(stepIndex, step);
        onDragStart();
      } else {
        let lastMouseX = ev.screenX;
        let lastMouseY = ev.screenY;
        let mouseHasMoved = false;
        const mouseMoveHandler = throttle((ev: MouseEvent) => {
          const mouseYDif = lastMouseY - ev.screenY + ev.screenX - lastMouseX;

          lastMouseX = ev.screenX;
          lastMouseY = ev.screenY;
          setInternalFillValue((prevValue) =>
            Math.max(0, Math.min(fillPercentageMax, prevValue + mouseYDif / MOUSE_DRAG_RANGE))
          );
          mouseHasMoved = true;
        }, MOUSE_MOUSE_THROTTLE);
        const mouseUpHandler = () => {
          window.removeEventListener('mousemove', mouseMoveHandler);
          window.removeEventListener('mouseup', mouseUpHandler);
          if (!mouseHasMoved) {
            onToggle(stepIndex, step);
          }
        };

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
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
      >
        <div
          className="sequencer-channel-step__fill"
          onMouseDown={onMouseDownHandler}
          onMouseEnter={onMouseEnterHandler}
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
