import React, { ReactNode, useEffect, useRef, useState } from "react";
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
import {
  InstrumentConfig,
  InstrumentConfigProps,
} from "../InstrumentConfig/InstrumentConfig";
import { getBlankPattern } from "../../state/state.utils";
import classNames from "classnames";
require("./_Sequencer.scss");

export interface SequencerProps
  extends Pick<
      SequencerChannelProps,
      "triggerCallback" | "showChannelControls" | "channelConfigComponents"
    >,
    Pick<InstrumentConfigProps, "instrumentConfigCallback"> {
  sequence: StateSequence;
  channelsConfig: StateSequenceChannelConfigCommon[];
  tick: number;
}

export const Sequencer: React.FC<SequencerProps> = ({
  sequence,
  channelsConfig,
  tick,
  triggerCallback = () => {},
  instrumentConfigCallback,
  ...otherSequencerChannelProps
}) => {
  const updateSequence = useSequencersState((state) =>
    state.updateSequence(sequence.name)
  );
  const addPage = useSequencersState((state) => state.addPage(sequence.name));
  const removePage = useSequencersState((state) =>
    state.removePage(sequence.name)
  );
  const lastTick = useRef(-1);
  const activeStepIndex = useRef(-1);
  const activePageIndex = useRef(0);
  const [visiblePage, setVisiblePage] = useState(0);
  const [
    stepPropertyCurrentlyBeingEdited,
    setStepPropertyCurrentlyBeingEdited,
  ] = useState<keyof StateSequenceStepProperties | null>(null);

  if (tick != lastTick.current) {
    lastTick.current = tick;

    activeStepIndex.current =
      tick <= 0 ? tick : (activeStepIndex.current + 1) % sequence.nSteps;

    if (tick <= 0) {
      activeStepIndex.current = tick;
    } else if (activeStepIndex.current === 0) {
      activePageIndex.current =
        (activePageIndex.current + 1) %
        sequence.patterns[sequence.currentPattern].pages.length;
    }

    // Trigger steps
    const stepsToTrigger = sequence.patterns[sequence.currentPattern].pages[
      activePageIndex.current
    ].steps.filter(({ stepIndex }) => stepIndex === activeStepIndex.current);
    stepsToTrigger.forEach((step) => {
      if (!sequence.isMuted && !channelsConfig[step.channel]?.isMuted) {
        if (
          [1, undefined].includes(step.probability) ||
          Math.random() < step.probability!
        ) {
          triggerCallback(step.channel, step);
        }
      }
    });
    console.log("tick");
  }

  useEffect(() => {
    if (sequence.midiOutDeviceName)
      registerMidiOutputDevice(sequence.midiOutDeviceName);
  }, [sequence.midiOutDeviceName]);

  console.log("sequencer rerender");

  return (
    <div className="sequencer">
      <InstrumentConfig
        sequence={sequence}
        instrumentConfigCallback={instrumentConfigCallback}
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
        ]}
        selectedTool={stepPropertyCurrentlyBeingEdited}
        onSelectTool={(tool) =>
          setStepPropertyCurrentlyBeingEdited(
            (tool as keyof StateSequenceStepProperties) || null
          )
        }
      />
      <div className="sequencer__body">
        <div className="sequencer__channels">
          {channelsConfig
            .filter(({ isHidden }) => !isHidden)
            .map((channelConfig, channelIndex) => (
              <SequencerChannel
                channelIndex={channelIndex}
                channelConfig={channelConfig}
                sequence={sequence}
                key={channelIndex}
                activeStepIndex={
                  visiblePage === activePageIndex.current
                    ? activeStepIndex.current
                    : -1
                }
                visiblePage={visiblePage}
                triggerCallback={triggerCallback}
                stepPropertyCurrentlyBeingEdited={
                  stepPropertyCurrentlyBeingEdited
                }
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
            icon="plus"
            onClick={() =>
              updateSequence({
                patterns: [...sequence.patterns, getBlankPattern()],
                currentPattern: sequence.patterns.length,
              })
            }
          />
          <Button
            icon="duplicate"
            onClick={() =>
              updateSequence({
                patterns: [
                  ...sequence.patterns,
                  cloneDeep(sequence.patterns[sequence.currentPattern]),
                ],
                currentPattern: sequence.patterns.length,
              })
            }
          />
          <Button
            icon="trash"
            onClick={() =>
              confirm("Are you sure you want to delete this pattern?") &&
              updateSequence({
                patterns:
                  sequence.patterns.length > 1
                    ? sequence.patterns.filter(
                        (_, index) => index !== sequence.currentPattern
                      )
                    : [getBlankPattern()],
                currentPattern: Math.max(0, sequence.currentPattern - 1),
              })
            }
          />
        </div>
      </div>
      <div className="sequencer__footer">
        <div className="sequencer__pattern-pagination">
          {[
            ...Array(sequence.patterns[sequence.currentPattern].pages.length),
          ].map((_, pageNumber) => (
            <Button
              className={classNames("sequencer__pattern-pagination-page", {
                "sequencer__pattern-pagination-page--is-visible":
                  pageNumber === activePageIndex.current,
              })}
              key={pageNumber}
              onClick={() => setVisiblePage(pageNumber)}
              active={pageNumber === visiblePage}
            />
          ))}
          <Button
            icon="plus"
            className="sequencer__pattern-pagination-control"
            onClick={() => addPage()}
          />
          <Button
            icon="duplicate"
            className="sequencer__pattern-pagination-control"
            onClick={() =>
              addPage(
                sequence.patterns[sequence.currentPattern].pages[visiblePage]
              )
            }
          />
          <Button
            icon="trash"
            className="sequencer__pattern-pagination-control"
            onClick={() => {
              if (sequence.patterns[sequence.currentPattern].pages.length < 2) {
                addPage();
              } else {
                activePageIndex.current =
                  activePageIndex.current %
                  (sequence.patterns[sequence.currentPattern].pages.length - 1);
                setVisiblePage(
                  visiblePage %
                    (sequence.patterns[sequence.currentPattern].pages.length -
                      1)
                );
              }
              removePage(visiblePage);
            }}
          />
        </div>
      </div>
    </div>
  );
};
