import React, { useEffect, useState } from "react";
import { App } from "./App";
import { DrumMachine } from "./components/DrumMachine/DrumMachine";
import { useSequencersState } from "./State";

export interface MainProps {
  app: App;
}

export const Main: React.FC<MainProps> = ({ app }) => {
  const [bpm, setBpm] = useState(120);
  const [clock, setClock] = useState(0);
  const [stepsPerBeat, setStepsPerBeat] = useState(4);
  const sequences = useSequencersState((state) => state.sequences);

  useEffect(() => {
    setInterval(() => {
      setClock((prev) => prev + 1);
    }, 60000 / stepsPerBeat / bpm);
  }, [bpm]);

  return (
    <div>
      {sequences.map((sequence) => (
        <DrumMachine sequence={sequence} key={sequence.name} clock={clock} />
      ))}
    </div>
  );
};
