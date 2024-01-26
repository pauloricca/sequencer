import classnames from "classnames";
import { throttle } from "lodash";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { StateSequenceStep } from "src/state/state.types";
require("./_SequencerChannelStep.scss");

const MOUSE_DRAG_RANGE = 50;
const MOUSE_MOUSE_THROTTLE = 150;

export interface SequencerChannelStepProps {
  isToggled: boolean;
  isActive: boolean;
  onToggle: () => void;
  onDragStart: () => void;
  isDraggingAlongChannel: boolean;
  isControllingFillPercentage?: boolean;
  /**
   * 0 - 1 value for the step height fill. this can be used for velocity and other parameters.
   */
  fillPercentage?: number;
  onFillPercentageChange?: (fillPercentage: number) => void;
}

export const SequencerChannelStep: React.FC<SequencerChannelStepProps> = ({
  isToggled,
  isActive,
  onToggle,
  onDragStart,
  isDraggingAlongChannel,
  isControllingFillPercentage = false,
  fillPercentage = 1,
  onFillPercentageChange = () => {},
}) => {
  const [internalFillValue, setInternalFillValue] = useState(fillPercentage);

  useEffect(() => setInternalFillValue(fillPercentage), [fillPercentage]);

  useEffect(() => {
    if (
      isControllingFillPercentage &&
      fillPercentage !== internalFillValue &&
      internalFillValue !== undefined
    ) {
      onFillPercentageChange(internalFillValue);
    }
  }, [internalFillValue]);

  const onMouseDownHandler: MouseEventHandler = (ev) => {
    if (!isControllingFillPercentage) {
      onToggle();
      onDragStart();
    } else {
      // if (!isToggled) {
      //   onToggle();
      // }
      let lastMouseX = ev.screenX;
      let lastMouseY = ev.screenY;
      let mouseHasMoved = false;
      const mouseMoveHandler = throttle((ev: MouseEvent) => {
        const mouseYDif = lastMouseY - ev.screenY + ev.screenX - lastMouseX;
        lastMouseX = ev.screenX;
        lastMouseY = ev.screenY;
        setInternalFillValue((prevValue) =>
          Math.max(
            0,
            Math.min(
              1,
              prevValue +
                mouseYDif / MOUSE_DRAG_RANGE
            )
          )
        );
        mouseHasMoved = true;
      }, MOUSE_MOUSE_THROTTLE);
      const mouseUpHandler = () => {
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
        if (!mouseHasMoved) {
          onToggle();
        }
      };
      window.addEventListener("mousemove", mouseMoveHandler);
      window.addEventListener("mouseup", mouseUpHandler);
    }
  };

  const onMouseEnterHandler = () => {
    if (!isControllingFillPercentage && isDraggingAlongChannel) {
      onToggle();
    }
  };

  return (
    <div
      className={classnames("sequencer-channel-step", {
        "sequencer-channel-step--is-toggled": isToggled,
        "sequencer-channel-step--is-active": isActive,
      })}
      onMouseDown={onMouseDownHandler}
      onMouseEnter={onMouseEnterHandler}
    >
      <div className="sequencer-channel-step__fill" style={{height: `${fillPercentage * 100}%`}} />
    </div>
  );
};
