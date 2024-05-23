import React, { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSequencersState } from 'state/state';
import { Icon } from '@blueprintjs/core';
import classNames from 'classnames';
require('./_ControllerControlsConfigModalSequence.scss');

interface ControllerControlsConfigModalSequenceProps {
  id: string;
  name: string;
  type: string;
}

export const ControllerControlsConfigModalSequence: React.FC<
  ControllerControlsConfigModalSequenceProps
> = ({ id, name, type }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const updateSequence = useSequencersState((state) => state.updateSequence);
  // Intermediate sequence name so that we can temporarily have duplicate names
  const [intermediateSequenceName, setIntermediateSequenceName] = useState(name);
  const isSequenceNameDuplicated = useSequencersState((state) =>
    state.sequences.find(
      ({ id: otherId, name }) => name === intermediateSequenceName && otherId !== id
    )
  );

  useEffect(() => {
    if (!isSequenceNameDuplicated) {
      updateSequence(id, { name: intermediateSequenceName });
    }
  }, [intermediateSequenceName]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="controller-controls-config-modal-sequence"
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <Icon
        className={classNames('controller-controls-config-modal-sequence__drag-handle', {
          'controller-controls-config-modal-sequence__drag-handle--is-dragging': isDragging,
        })}
        icon="drag-handle-horizontal"
        {...listeners}
      />
      <input
        type="text"
        className={classNames('controller-controls-config-modal-sequence__name-input', {
          'input--in-error': isSequenceNameDuplicated,
        })}
        value={intermediateSequenceName}
        onClick={(ev) => ev.stopPropagation()}
        onChange={(ev) => setIntermediateSequenceName((ev.target as HTMLInputElement).value)}
      />
      {isSequenceNameDuplicated && <p>duplicated name</p>}
      <div className="controller-controls-config-modal-sequence__type">{type}</div>
    </div>
  );
};
