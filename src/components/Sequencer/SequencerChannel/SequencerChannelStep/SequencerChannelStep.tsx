import classnames from "classnames";
import React, { useEffect, useState } from "react";
require("./_SequencerChannelStep.scss");

export interface SequencerChannelStepProps {
  isActive: boolean;
  triggerCallback: () => void;
}

export const SequencerChannelStep: React.FC<SequencerChannelStepProps> = ({
  isActive,
  triggerCallback,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isActive && isChecked) triggerCallback();
  }, [isActive]);

  return (
    <div
      className={classnames("sequencer-channel-step", {
        "sequencer-channel-step--is-checked": isChecked,
        "sequencer-channel-step--is-active": isActive,
      })}
      onClick={() => setIsChecked(!isChecked)}
    ></div>
  );
};
