import React, { useEffect, useState } from 'react';
import { useSequencersState } from 'state/state';
import { SelectKnob } from 'components/SelectKnob/SelectKnob';
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
import { Button } from 'components/Button/Button';
import { ControllerControlsConfigModal } from './ControllerControlsConfigModal/ControllerControlsConfigModal';
require('./_ControllerControls.scss');

export const ControllerControls: React.FC = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
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
      <Button icon="cog" onClick={() => setIsConfigOpen(true)} />
      <Button text="reset" icon="delete" onClick={() => resetState()} />
      <Button
        icon="floppy-disk"
        onClick={() => downloadObjectAsJson(useSequencersState.getState(), 'sequencer')}
      />
      <Button
        icon="export"
        onClick={() => uploadJsonFileAsObject<State>((obj) => resetState(obj))}
      />
      <SelectKnob
        label={`${clockSpeed / 4}bpm`}
        value={clockSpeed / 4}
        type="numeric"
        min={1}
        max={600}
        onChange={(value) => setClockSpeed(value * 4)}
      />
      <SelectKnob
        label={`${Math.round(swing * 100)}% swing`}
        value={swing ?? 0.5}
        type="numeric"
        min={0.5}
        max={0.9}
        step={0.05}
        onChange={(value) => setSwing(value)}
        showDial
      />
      {isPlaying && (
        <Button isActive={true} icon="symbol-square" onClick={() => setIsPlaying(false)} />
      )}
      {!isPlaying && <Button icon="play" onClick={() => setIsPlaying(true)} />}
      <ControllerControlsConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </div>
  );
};
