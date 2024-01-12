import React, { useEffect, useState } from "react";
import { App } from "./App";
import { DrumMachine } from "./components/DrumMachine/DrumMachine";
import { useSequencersState } from "./state/state";
import { Synth } from "./components/Synth/Synth";

export interface MainProps {
  app: App;
}

export const Main: React.FC<MainProps> = ({ app }) => {
  const [clock, setClock] = useState(0);
  const sequences = useSequencersState((state) => state.sequences);
  const clockSpeed = useSequencersState((state) => state.clockSpeed);
  const resetState = useSequencersState((state) => state.reset);

  useEffect(() => {
    setInterval(() => {
      setClock((prev) => prev + 1);
    }, 60000 / clockSpeed);
  }, [clockSpeed]);

  return (
    <div className="instruments">
      <button onClick={resetState}>reset</button>
      {sequences.map((sequence) => (
        <div className="instrument" key={sequence.name}>
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
