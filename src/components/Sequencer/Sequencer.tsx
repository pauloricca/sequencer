import React, { ReactNode, useEffect, useState } from "react";
import {
  SequencerChannel,
  SequencerChannelProps,
} from "./SequencerChannel/SequencerChannel";
import {
  StateSequence,
  StateSequenceChannelConfigCommon,
  StateSequenceStepProperties,
} from "../../state/state.types";
import { registerMidiOutputDevice } from "../../utils/midi";
import { Button } from "@blueprintjs/core";
import { useSequencersState } from "../../state/state";
import { cloneDeep } from "lodash";
import { InstrumentConfig } from "../InstrumentConfig/InstrumentConfig";
require("./_Sequencer.scss");

export interface SequencerProps
  extends Pick<
    SequencerChannelProps,
    "triggerCallback" | "showChannelControls" | "channelConfigComponents"
  > {
  sequence: StateSequence;
  channelsConfig: StateSequenceChannelConfigCommon[];
  tick: number;
  instrumentConfig?: ReactNode;
}

export const Sequencer: React.FC<SequencerProps> = ({
  sequence,
  channelsConfig,
  tick,
  triggerCallback = () => {},
  instrumentConfig,
  ...otherSequencerChannelProps
}) => {
  const updateSequence = useSequencersState((state) =>
    state.updateSequence(sequence.name)
  );
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [
    stepPropertyCurrentlyBeingEdited,
    setStepPropertyCurrentlyBeingEdited,
  ] = useState<keyof StateSequenceStepProperties | null>(null);

  useEffect(() => {
    setActiveStepIndex(
      tick <= 0 ? tick : (activeStepIndex + 1) % sequence.nSteps
    );
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
      (step) => {
        if (!channelsConfig[step.channel]?.isMuted) {
          if (
            [1, undefined].includes(step.probability) ||
            Math.random() < step.probability!
          ) {
            triggerCallback(step.channel, step);
          }
        }
      }
    );
  }, [activeStepIndex]);

  return (
    <div className="sequencer__outer">
      <InstrumentConfig
        sequence={sequence}
        tools={[
          {
            name: "default",
            value: null,
            icon: "heat-grid",
          },
          {
            name: "volume",
            value: "volume",
            icon: "vertical-bar-chart-asc",
          },
          {
            name: "probability",
            value: "probability",
            icon: "heatmap",
          },
          // {
          //   name: "length",
          //   value: "length",
          //   icon: "drawer-left-filled",
          // },
        ]}
        selectedTool={stepPropertyCurrentlyBeingEdited}
        onSelectTool={(tool) =>
          setStepPropertyCurrentlyBeingEdited(
            tool as keyof StateSequenceStepProperties || null
          )
        }
      />
      <div className="sequencer">
        <div className="sequencer__channels">
          {channelsConfig
            .filter(({ isHidden }) => !isHidden)
            .map((channelConfig, channelIndex) => (
              <SequencerChannel
                channelIndex={channelIndex}
                channelConfig={channelConfig}
                sequence={sequence}
                key={channelIndex}
                activeStepIndex={activeStepIndex}
                triggerCallback={triggerCallback}
                stepPropertyCurrentlyBeingEdited={stepPropertyCurrentlyBeingEdited}
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
    </div>
  );
};
