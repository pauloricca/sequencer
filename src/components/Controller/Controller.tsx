import React, { useEffect, useRef, useState } from "react";
import { DrumMachine } from "../DrumMachine/DrumMachine";
import { useSequencersState } from "../../state/state";
import { Synth } from "../Synth/Synth";
import { Button } from "@blueprintjs/core";
import downloadObjectAsJson from "../../utils/downloadObjectAsJson";
import uploadJsonFileAsObject from "../../utils/uploadJsonFileAsObject";
import { InstrumentConfigKnob } from "../InstrumentConfig/InstrumentConfigKnob/InstrumentConfigKnob";
import { StateSequence } from "state/state.types";
import { Metronome } from "../../utils/metronome";
import { getIntervalFromClockSpeed } from "./Controller.utils";
require("./_Controller.scss");

export const Controller: React.FC = () => {
  const [clock, setClock] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const metronome = useRef<Metronome>();
  const state = useSequencersState((state) => state);
  const sequences = useSequencersState((state) => state.sequences);
  const clockSpeed = useSequencersState((state) => state.clockSpeed);
  const setClockSpeed = useSequencersState((state) => state.setClockSpeed);
  const resetState = useSequencersState((state) => state.reset);

  useEffect(() => {
    metronome.current = new Metronome(
      () => setClock((prev) => prev + 1),
      getIntervalFromClockSpeed(clockSpeed)
    );
  }, []);

  useEffect(() => {
    metronome.current?.setInterval(getIntervalFromClockSpeed(clockSpeed));
  }, [clockSpeed]);

  useEffect(() => {
    if (isPlaying) {
      metronome.current?.start();
    } else {
      setClock(-1);
      metronome.current?.stop();
    }
  }, [isPlaying]);

  const getSequencerTick = (sequence: StateSequence) =>
    clock === -1 ? clock : Math.floor(clock / sequence.stepLength);

  return (
    // <StrictMode>
      <div className="controller">
        <div className="controller__controls">
          <Button
            text="reset"
            rightIcon="delete"
            fill={true}
            onClick={() => resetState()}
          />
          <Button
            text="load"
            rightIcon="export"
            fill={true}
            onClick={() => uploadJsonFileAsObject((obj) => resetState(obj))}
          />
          <Button
            text="save"
            rightIcon="import"
            fill={true}
            onClick={() => downloadObjectAsJson(state, "sequencer")}
          />
          <InstrumentConfigKnob
            label={`bpm: ${state.clockSpeed / 4}`}
            value={state.clockSpeed / 4}
            min={30}
            max={600}
            isIntegerOnly={true}
            onChange={(value) => setClockSpeed(value * 4)}
          />
          {isPlaying && (
            <Button
              text="stop"
              active={true}
              rightIcon="symbol-square"
              fill={true}
              onClick={() => setIsPlaying(false)}
            />
          )}
          {!isPlaying && (
            <Button
              text="play"
              rightIcon="play"
              fill={true}
              onClick={() => setIsPlaying(true)}
            />
          )}
        </div>
        {sequences.map((sequence, sequenceIndex) => (
          <div key={sequenceIndex}>
            {sequence.type === "drum-machine" && (
              <DrumMachine
                sequence={sequence}
                tick={getSequencerTick(sequence)}
              />
            )}
            {sequence.type === "synth" && (
              <Synth sequence={sequence} tick={getSequencerTick(sequence)} />
            )}
          </div>
        ))}
      </div>
    // </StrictMode>
  );
};
