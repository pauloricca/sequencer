import React, { useEffect, useState } from 'react';
import { DrumMachine } from 'components/DrumMachine/DrumMachine';
import { useSequencersState } from 'state/state';
import { Synth } from 'components/Synth/Synth';
import { Button } from '@blueprintjs/core';
import downloadObjectAsJson from 'utils/downloadObjectAsJson';
import uploadJsonFileAsObject from 'utils/uploadJsonFileAsObject';
import { setMetronomeInterval, startMetronome, stopMetronome } from 'utils/metronome';
import { getIntervalFromClockSpeed } from './Controller.utils';
import { State } from 'state/state.types';
import { InstrumentConfigSelectKnob } from 'components/InstrumentConfig/InstrumentConfigSelectKnob/InstrumentConfigSelectKnob';
import { ShortcutController } from 'components/ShortcutController/ShortcutController';
import { allSoundsOff } from 'utils/midi';
require('./_Controller.scss');

export const Controller: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const state = useSequencersState((state) => state);
  const sequences = useSequencersState((state) => state.sequences);
  const clockSpeed = useSequencersState((state) => state.clockSpeed);
  const setClockSpeed = useSequencersState((state) => state.setClockSpeed);
  const resetState = useSequencersState((state) => state.reset);

  useEffect(() => {
    setMetronomeInterval(getIntervalFromClockSpeed(clockSpeed));
  }, [clockSpeed]);

  useEffect(() => {
    if (isPlaying) {
      startMetronome();
    } else {
      allSoundsOff();
      stopMetronome();
    }
  }, [isPlaying]);

  return (
    // <StrictMode>
    <div className="controller">
      <div className="controller__controls">
        <Button text="reset" rightIcon="delete" fill={true} onClick={() => resetState()} />
        <Button
          text="load"
          rightIcon="export"
          fill={true}
          onClick={() => uploadJsonFileAsObject<State>((obj) => resetState(obj))}
        />
        <Button
          text="save"
          rightIcon="import"
          fill={true}
          onClick={() => downloadObjectAsJson(state, 'sequencer')}
        />
        <InstrumentConfigSelectKnob
          label={`bpm: ${state.clockSpeed / 4}`}
          value={state.clockSpeed / 4}
          type="numeric"
          min={5}
          max={600}
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
          <Button text="play" rightIcon="play" fill={true} onClick={() => setIsPlaying(true)} />
        )}
      </div>
      {sequences.map((sequence, sequenceIndex) => (
        <div key={sequenceIndex}>
          {sequence.type === 'drum-machine' && <DrumMachine sequence={sequence} />}
          {sequence.type === 'synth' && <Synth sequence={sequence} />}
        </div>
      ))}
      <ShortcutController />
    </div>
    // </StrictMode>
  );
};
