import classnames from "classnames";
import React from "react";
import { StateSequenceStep } from "src/state/state.types";
require("./_SequencerChannelStep.scss");

export interface SequencerChannelStepProps {
  isToggled: boolean;
  isActive: boolean;
  onToggle: () => void;
  onDragStart: () => void;
  isDraggingAlongChannel: boolean;
}

export const SequencerChannelStep: React.FC<SequencerChannelStepProps> = ({
  isToggled,
  isActive,
  onToggle,
  onDragStart,
  isDraggingAlongChannel,
}) => {
  return (
    <div
      className={classnames("sequencer-channel-step", {
        "sequencer-channel-step--is-toggled": isToggled,
        "sequencer-channel-step--is-active": isActive,
      })}
      onMouseDown={() => {
        onToggle();
        onDragStart();
      }}
      onMouseEnter={() => isDraggingAlongChannel && onToggle()}
    ></div>
  );
};
