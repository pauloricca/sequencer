import React, { useEffect } from 'react';
import { useSequencersState } from 'state/state';
import { SelectKnob } from 'components/SelectKnob/SelectKnob';
import { Button } from '@blueprintjs/core';
import {
  setMetronomeInterval,
  setMetronomeSwing,
  startMetronome,
  stopMetronome,
} from 'utils/metronome';
import { getIntervalFromClockSpeed } from 'state/state.utils';
import { allSoundsOff } from 'utils/midi';
import uploadJsonFileAsObject from 'utils/uploadJsonFileAsObject';
import { State } from 'state/state.types';
import downloadObjectAsJson from 'utils/downloadObjectAsJson';
require('./_ControllerControls.scss');

export const ControllerControls: React.FC = () => {
  const isPlaying = useSequencersState((state) => state.isPlaying);
  const setIsPlaying = useSequencersState((state) => state.setIsPlaying);
  const clockSpeed = useSequencersState((state) => state.clockSpeed);
  const swing = useSequencersState((state) => state.swing);
  const setClockSpeed = useSequencersState((state) => state.setClockSpeed);
  const setSwing = useSequencersState((state) => state.setSwing);
  const resetState = useSequencersState((state) => state.reset);

  useEffect(() => {
    setMetronomeInterval(getIntervalFromClockSpeed(clockSpeed));
  }, [clockSpeed]);

  useEffect(() => {
    setMetronomeSwing(swing);
  }, [swing]);

  useEffect(() => {
    if (isPlaying) {
      startMetronome();
    } else {
      allSoundsOff();
      stopMetronome();
    }
  }, [isPlaying]);

  return (
    <div className="controller-controls">
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
        min={1}
        max={600}
        onChange={(value) => setClockSpeed(value * 4)}
      />
      <SelectKnob
        label={`swing: ${Math.round(swing * 100)}%`}
        value={swing ?? 0.5}
        type="numeric"
        min={0.5}
        max={0.9}
        step={0.05}
        onChange={(value) => setSwing(value)}
        showDial
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
  );
};
