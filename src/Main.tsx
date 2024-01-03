import React from "react";
import { App } from "./App";
import { Sequencer } from "./components/Sequencer/Sequencer";

export interface MainProps
{
    app: App;
}

export const Main: React.FC<MainProps> = ({ app }) => {
  return (
    <Sequencer nSteps={16} nChannels={6} />
  );
};
