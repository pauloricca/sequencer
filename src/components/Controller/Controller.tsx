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
    (state) => state.sequences.map(({ id, type }) => ({ id, type })),
    isEqual
  );

  return (
    <div className="controller">
      <div className="controller__header">
        <ControllerControls />
      </div>
      <div className="controller__sequences">
        <ErrorBoundary error="Saved state not compatible with current version. Please press reset and refresh the page.">
          {sequences.map(({ id, type }) => (
            <Fragment key={id}>
              {type === 'drum-machine' && <DrumMachine sequenceId={id} />}
              {type === 'synth' && <Synth sequenceId={id} />}
            </Fragment>
          ))}
          <ShortcutController />
        </ErrorBoundary>
      </div>
    </div>
  );
};
