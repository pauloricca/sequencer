import React from 'react';
import { DrumMachine } from 'components/DrumMachine/DrumMachine';
import { useSequencersState } from 'state/state';
import { Synth } from 'components/Synth/Synth';

interface ControllerInstrumentProps {
  sequenceName: string;
}

export const ControllerInstrument: React.FC<ControllerInstrumentProps> = ({ sequenceName }) => {
  const sequence = useSequencersState((state) =>
    state.sequences.find(({ name }) => name === sequenceName)
  );

  if (!sequence) return null;

  return (
    <div className="controller-instrument">
      {sequence.type === 'drum-machine' && <DrumMachine sequence={sequence} />}
      {sequence.type === 'synth' && <Synth sequence={sequence} />}
    </div>
  );
};
