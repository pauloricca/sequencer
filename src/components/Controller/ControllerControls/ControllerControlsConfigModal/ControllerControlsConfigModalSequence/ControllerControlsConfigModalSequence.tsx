import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSequencersState } from 'state/state';
import { Icon, InputGroup } from '@blueprintjs/core';
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
      <InputGroup
        className="controller-controls-config-modal-sequence__name-input"
        value={name}
        onClick={(ev) => ev.stopPropagation()}
        onValueChange={(value) => updateSequence(id, { name: value })}
      />
      <div className="controller-controls-config-modal-sequence__type">{type}</div>
    </div>
  );
};
