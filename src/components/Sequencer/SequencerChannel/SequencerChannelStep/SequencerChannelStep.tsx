import classnames from "classnames";
import React from "react";
import { StateSequenceStep } from "../../../../State";
require("./_SequencerChannelStep.scss");

export interface SequencerChannelStepProps {
  step?: StateSequenceStep;
  isActive: boolean;
  onClick: () => void;
}

export const SequencerChannelStep: React.FC<SequencerChannelStepProps> = ({
  step,
  isActive,
  onClick,
}) => {
  const isChecked = !!step;

  return (
    <div
      className={classnames("sequencer-channel-step", {
        "sequencer-channel-step--is-checked": isChecked,
        "sequencer-channel-step--is-active": isActive,
      })}
      onClick={() => onClick()}
      onDragEnter={() => console.log('paulo drag enter')}
      onDragOver={() => console.log('paulo drag over')}
      onDragStart={() => console.log('paulo drag start')}
    ></div>
  );
};
