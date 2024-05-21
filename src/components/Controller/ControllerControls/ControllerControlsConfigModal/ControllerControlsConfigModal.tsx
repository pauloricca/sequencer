import React from 'react';
import { Modal } from 'components/Modal/Modal';
import { ModalProps } from 'components/Modal/Modal.types';
import { useSequencersState } from 'state/state';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { isEqual } from 'lodash';
import { ControllerControlsConfigModalSequence } from './ControllerControlsConfigModalSequence/ControllerControlsConfigModalSequence';
require('./_ControllerControlsConfigModal.scss');

export const ControllerControlsConfigModal: React.FC<Omit<ModalProps, 'children'>> = (props) => {
  const sequences = useSequencersState(
    (state) => state.sequences.map(({ id, name, type }) => ({ id, name, type })),
    isEqual
  );
  const updateSequenceOrder = useSequencersState((state) => state.updateSequenceOrder);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sequences.findIndex(({ id }) => id === active.id);
      const newIndex = sequences.findIndex(({ id }) => id === over?.id);

      updateSequenceOrder(oldIndex, newIndex);
    }
  };

  return (
    <Modal {...props}>
      {!!props.isOpen && (
        <>
          <div className="controller-controls-config-modal__sequences">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sequences} strategy={verticalListSortingStrategy}>
                {sequences.map(({ id, name, type }) => (
                  <ControllerControlsConfigModalSequence key={id} id={id} name={name} type={type} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </>
      )}
    </Modal>
  );
};
