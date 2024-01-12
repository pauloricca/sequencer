import React, { useEffect } from "react";
import { SequencerChannel } from "./SequencerChannel/SequencerChannel";
import { StateSequence } from "../../state/state.types";
import { registerMidiOutputDevice } from "../../utils/midi";
require("./_Sequencer.scss");

export interface SequencerProps {
  sequence: StateSequence;
  tick: number;
  triggerCallback: (channel: number) => void;
}

export const Sequencer: React.FC<SequencerProps> = ({
  sequence,
  tick,
  triggerCallback,
}) => {
  const activeStepIndex = tick % sequence.nSteps;

  useEffect(() => {
    if (sequence.midiOutDeviceName) registerMidiOutputDevice(sequence.midiOutDeviceName);
  }, [sequence.midiOutDeviceName]);

  useEffect(() => {
    const stepsToTrigger = sequence.steps.filter(
      ({ stepIndex }) => stepIndex === activeStepIndex
    );
    stepsToTrigger.forEach((step) => triggerCallback(step.channel));
  }, [activeStepIndex]);

  return (
    <div className="sequencer">
      {sequence.channelsConfig.map((channelConfig, channelIndex) => (
        <SequencerChannel
          channelIndex={channelIndex}
          channelConfig={channelConfig}
          sequence={sequence}
          key={channelIndex}
          nSteps={sequence.nSteps}
          activeStepIndex={activeStepIndex}
        />
      ))}
    </div>
  );
};
