import React, { Fragment } from 'react';
import { useSequencersState } from 'state/state';
import { ShortcutController } from 'components/ShortcutController/ShortcutController';
import { isEqual } from 'lodash';
import { DrumMachine } from 'components/DrumMachine/DrumMachine';
import { Synth } from 'components/Synth/Synth';
import { ControllerControls } from './ControllerControls/ControllerControls';
import { ErrorBoundary } from 'components/ErrorBoundary/ErrorBoundary';
require('./_Controller.scss');

export const Controller: React.FC = () => {
  const sequences = useSequencersState(
    (state) => state.sequences.map(({ name, type }) => ({ name, type })),
    isEqual
  );

  return (
    <div className="controller">
      <ControllerControls />
      <ErrorBoundary error="Saved state not compatible with current version. Please press reset and refresh the page.">
        {sequences.map(({ name, type }) => (
          <Fragment key={name}>
            {type === 'drum-machine' && <DrumMachine sequenceName={name} />}
            {type === 'synth' && <Synth sequenceName={name} />}
          </Fragment>
        ))}
        <ShortcutController />
      </ErrorBoundary>
    </div>
  );
};
