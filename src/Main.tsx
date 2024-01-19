import React, { useEffect, useRef, useState } from "react";
import { App } from "./App";
import { DrumMachine } from "./components/DrumMachine/DrumMachine";
import { useSequencersState } from "./state/state";
import { Synth } from "./components/Synth/Synth";
import { Button } from "@blueprintjs/core";
import downloadObjectAsJson from "./utils/downloadObjectAsJson";
import uploadJsonFileAsObject from "./utils/uploadJsonFileAsObject";
import { InstrumentConfigKnob } from "./components/InstrumentConfig/InstrumentConfigKnob/InstrumentConfigKnob";
import Metronome from "./utils/metronome";

export interface MainProps {
  app: App;
}

export const Main: React.FC<MainProps> = ({ app }) => {
  const [clock, setClock] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const metronome = useRef<Metronome>();
  const state = useSequencersState((state) => state);
  const sequences = useSequencersState((state) => state.sequences);
  const clockSpeed = useSequencersState((state) => state.clockSpeed);
  const setClockSpeed = useSequencersState((state) => state.setClockSpeed);
  const resetState = useSequencersState((state) => state.reset);

  const getIntervalFromClockSpeed = (clockSpeed: number) => 60000 / clockSpeed;

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

  return (
    <div className="instruments">
      <div className="instruments__controls">
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
          label={`bpm: ${state.clockSpeed / 16}`}
          value={state.clockSpeed / 16}
          min={30}
          max={600}
          isIntegerOnly={true}
          onChange={(value) => setClockSpeed(value * 16)}
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
              tick={Math.floor(clock / sequence.stepLength)}
            />
          )}
          {sequence.type === "synth" && (
            <Synth
              sequence={sequence}
              tick={Math.floor(clock / sequence.stepLength)}
            />
          )}
        </div>
      ))}
    </div>
  );
};
