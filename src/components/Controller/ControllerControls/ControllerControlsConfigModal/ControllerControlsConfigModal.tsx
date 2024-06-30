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
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { PRESETS } from 'presets/presets';
import { Button } from 'components/Button/Button';
import { ControllerControlsConfigModalMidiClockSend } from './ControllerControlsConfigModalMidiClockSend/ControllerControlsConfigModalMidiClockSend';
require('./_ControllerControlsConfigModal.scss');

export const ControllerControlsConfigModal: React.FC<Omit<ModalProps, 'children'>> = (props) => {
  const sequences = useSequencersState(
    (state) => state.sequences.map(({ id, name, type }) => ({ id, name, type })),
    isEqual
  );
  const addSequence = useSequencersState((state) => state.addSequence);
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
        <div className="controller-controls-config-modal">
          <div className="controller-controls-config-modal__sequences">
            <div className="controller-controls-config-modal__sequences-list">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={sequences} strategy={verticalListSortingStrategy}>
                  {sequences.map(({ id, name, type }) => (
                    <ControllerControlsConfigModalSequence
                      key={id}
                      id={id}
                      name={name}
                      type={type}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <div className="controller-controls-config-modal__sequence-presets">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  text={`add ${preset.name}`}
                  onClick={() => addSequence(preset)}
                />
              ))}
            </div>
          </div>
          <ControllerControlsConfigModalMidiClockSend />
        </div>
      )}
    </Modal>
  );
};
