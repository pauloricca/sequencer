import React, { ReactNode, useEffect, useState } from "react";
import { SequencerChannel, SequencerChannelProps } from "./SequencerChannel/SequencerChannel";
import {
  StateSequence,
  StateSequenceChannelConfig,
} from "../../state/state.types";
import { registerMidiOutputDevice } from "../../utils/midi";
import { Button } from "@blueprintjs/core";
import { useSequencersState } from "../../state/state";
import { cloneDeep } from "lodash";
require("./_Sequencer.scss");

export interface SequencerProps
  extends Pick<
    SequencerChannelProps,
    "triggerCallback" | "showChannelControls" | "channelConfigComponents"
  > {
  sequence: StateSequence;
  channelsConfig: StateSequenceChannelConfig[];
  tick: number;
}

export const Sequencer: React.FC<SequencerProps> = ({
  sequence,
  channelsConfig,
  tick,
  triggerCallback = () => {},
  ...otherSequencerChannelProps
}) => {
  const updateSequence = useSequencersState((state) =>
    state.updateSequence(sequence.name)
  );
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  useEffect(() => {
    setActiveStepIndex(tick === 0 ? 0 : ((activeStepIndex + 1) % sequence.nSteps))
  }, [tick]);

  useEffect(() => {
    if (sequence.midiOutDeviceName)
      registerMidiOutputDevice(sequence.midiOutDeviceName);
  }, [sequence.midiOutDeviceName]);

  useEffect(() => {
    const stepsToTrigger = sequence.patterns[
      sequence.currentPattern
    ].steps.filter(({ stepIndex }) => stepIndex === activeStepIndex);
    stepsToTrigger.forEach(
      (step) =>
        !channelsConfig[step.channel]?.isMuted && triggerCallback(step.channel)
    );
  }, [activeStepIndex]);

  return (
    <div className="sequencer">
      <div className="sequencer__channels">
        {channelsConfig.map((channelConfig, channelIndex) => (
          <SequencerChannel
            channelIndex={channelIndex}
            channelConfig={channelConfig}
            sequence={sequence}
            key={channelIndex}
            activeStepIndex={activeStepIndex}
            triggerCallback={triggerCallback}
            {...otherSequencerChannelProps}
          />
        ))}
      </div>
      <div className="sequencer__patterns">
        {sequence.patterns.map((_, patternIndex) => (
          <Button
            text={patternIndex}
            key={patternIndex}
            onClick={() => updateSequence({ currentPattern: patternIndex })}
            active={sequence.currentPattern === patternIndex}
          />
        ))}
        <Button
          icon="add"
          onClick={() => {
            updateSequence({
              patterns: [...sequence.patterns, { steps: [] }],
              currentPattern: sequence.patterns.length,
            });
          }}
        />
        <Button
          icon="duplicate"
          onClick={() => {
            updateSequence({
              patterns: [
                ...sequence.patterns,
                cloneDeep(sequence.patterns[sequence.currentPattern]),
              ],
              currentPattern: sequence.patterns.length,
            });
          }}
        />
        <Button
          icon="delete"
          onClick={() => {
            confirm("Are you sure you want to delete this pattern?") &&
              updateSequence({
                patterns:
                  sequence.patterns.length > 1
                    ? sequence.patterns.filter(
                        (_, index) => index !== sequence.currentPattern
                      )
                    : [{ steps: [] }],
                currentPattern: Math.max(0, sequence.currentPattern - 1),
              });
          }}
        />
      </div>
    </div>
  );
};
