import React, { useEffect } from "react";
import { SequencerChannel } from "./SequencerChannel/SequencerChannel";
import {
  StateSequence,
  StateSequenceChannelConfig,
} from "../../state/state.types";
import { registerMidiOutputDevice } from "../../utils/midi";
import { Button } from "@blueprintjs/core";
import { useSequencersState } from "../../state/state";
import { cloneDeep } from "lodash";
require("./_Sequencer.scss");

export interface SequencerProps {
  sequence: StateSequence;
  channelsConfig: StateSequenceChannelConfig[];
  tick: number;
  triggerCallback: (channel: number) => void;
  showChannelControls?: boolean;
}

export const Sequencer: React.FC<SequencerProps> = ({
  sequence,
  channelsConfig,
  tick,
  triggerCallback,
  showChannelControls = false,
}) => {
  const updateSequence = useSequencersState((state) =>
    state.updateSequence(sequence.name)
  );

  const activeStepIndex = tick % sequence.nSteps;

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
            showChannelControls={showChannelControls}
          />
        ))}
      </div>
      <div className="sequencer__patterns">
        {sequence.patterns.map((_, patternIndex) => (
          <Button
            text={`pattern ${patternIndex}`}
            key={patternIndex}
            onClick={() => updateSequence({ currentPattern: patternIndex })}
            active={sequence.currentPattern === patternIndex}
          />
        ))}
        <Button
          text={`new`}
          onClick={() => {
            updateSequence({
              patterns: [...sequence.patterns, { steps: [] }],
              currentPattern: sequence.patterns.length,
            });
          }}
        />
        <Button
          text={`duplicate`}
          onClick={() => {
            updateSequence({
              patterns: [...sequence.patterns, cloneDeep(sequence.patterns[sequence.currentPattern]) ],
              currentPattern: sequence.patterns.length,
            });
          }}
        />
        <Button
          text={`delete`}
          onClick={() => {
            confirm("Are you sure you want to delete this pattern?") && updateSequence({
              patterns: sequence.patterns.filter((_, index) => index !== sequence.currentPattern),
              currentPattern: Math.min(0, sequence.currentPattern - 1),
            });
          }}
        />
      </div>
    </div>
  );
};
