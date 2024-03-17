import React, { useEffect, useState } from 'react';
import { useSequencersState } from 'state/state';
import { Button } from '@blueprintjs/core';
import downloadObjectAsJson from 'utils/downloadObjectAsJson';
import uploadJsonFileAsObject from 'utils/uploadJsonFileAsObject';
import { setMetronomeInterval, startMetronome, stopMetronome } from 'utils/metronome';
import { State } from 'state/state.types';
import { SelectKnob } from 'components/SelectKnob/SelectKnob';
import { ShortcutController } from 'components/ShortcutController/ShortcutController';
import { allSoundsOff } from 'utils/midi';
import { isEqual } from 'lodash';
import { getIntervalFromClockSpeed } from './Controller.utils';
import { DrumMachine } from 'components/DrumMachine/DrumMachine';
import { Synth } from 'components/Synth/Synth';
require('./_Controller.scss');

export const Controller: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const sequences = useSequencersState(
    (state) => state.sequences.map(({ name, type }) => ({ name, type })),
    isEqual
  );
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
          onClick={() => downloadObjectAsJson(useSequencersState.getState(), 'sequencer')}
        />
        <SelectKnob
          label={`bpm: ${clockSpeed / 4}`}
          value={clockSpeed / 4}
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
      {sequences.map(({ name, type }) => (
        <>
          {type === 'drum-machine' && <DrumMachine sequenceName={name} />}
          {type === 'synth' && <Synth sequenceName={name} />}
        </>
      ))}
      <ShortcutController />
    </div>
    // </StrictMode>
  );
};
