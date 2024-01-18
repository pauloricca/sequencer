import React, { useEffect, useRef, useState } from "react";
import { App } from "./App";
import { DrumMachine } from "./components/DrumMachine/DrumMachine";
import { useSequencersState } from "./state/state";
import { Synth } from "./components/Synth/Synth";
import { Button } from "@blueprintjs/core";
import downloadObjectAsJson from "./utils/downloadObjectAsJson";
import uploadJsonFileAsObject from "./utils/uploadJsonFileAsObject";
import { InstrumentConfigKnob } from "./components/InstrumentConfig/InstrumentConfigKnob/InstrumentConfigKnob";

export interface MainProps {
  app: App;
}

export const Main: React.FC<MainProps> = ({ app }) => {
  const [clock, setClock] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(isPlaying);
  const clockInterval = useRef<number>();
  const state = useSequencersState((state) => state);
  const sequences = useSequencersState((state) => state.sequences);
  const clockSpeed = useSequencersState((state) => state.clockSpeed);
  const setClockSpeed = useSequencersState((state) => state.setClockSpeed);
  const resetState = useSequencersState((state) => state.reset);

  useEffect(() => {
    if (clockInterval.current) {
      clearInterval(clockInterval.current);
    }
    clockInterval.current = setInterval(() => {
      setClock((prev) => (isPlayingRef.current ? prev + 1 : -1));
    }, 60000 / clockSpeed) as any as number;
  }, [clockSpeed]);

  // Update ref to be used inside the clock interval
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  return (
    <div className="instruments">
      <div className="instruments__controls">
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
        <InstrumentConfigKnob
          label={`bpm: ${state.clockSpeed / 16}`}
          value={state.clockSpeed / 16}
          min={30}
          max={600}
          isIntegerOnly={true}
          onChange={(value) => setClockSpeed(value * 16)}
        />
        <Button
          text="save"
          rightIcon="import"
          fill={true}
          onClick={() => downloadObjectAsJson(state, "sequencer")}
        />
        <Button
          text="load"
          rightIcon="export"
          fill={true}
          onClick={() => uploadJsonFileAsObject((obj) => resetState(obj))}
        />
        <Button
          text="reset"
          rightIcon="delete"
          fill={true}
          onClick={() => resetState()}
        />
      </div>
      {sequences.map((sequence) => (
        <div key={sequence.name}>
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
