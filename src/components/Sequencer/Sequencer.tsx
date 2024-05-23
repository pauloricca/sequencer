import React, { useState } from 'react';
import { StateSequenceStepProperties } from 'state/state.types';
import { useSequencersState } from 'state/state';
import { SequencerConfig } from 'components/Sequencer/SequencerConfig/SequencerConfig';
import classNames from 'classnames';
import { SequencerGrid } from './SequencerGrid/SequencerGrid';
import { isEqual } from 'lodash';
import { SequencerProps } from './Sequencer.types';
import { Button } from 'components/Button/Button';
import { SequencerConfigMutation } from './SequencerConfig/SequencerConfigMutation/SequencerConfigMutation';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SequencerSortingItem } from './SequencerSortingItem/SequencerSortingItem';
require('./_Sequencer.scss');

export const Sequencer: React.FC<SequencerProps> = ({
  sequenceId,
  channelsConfig,
  triggerCallback = () => {},
  sequencerConfigCallback,
  ...otherSequencerChannelProps
}) => {
  const { patternIds, currentPatternPageIds, currentPattern, sequenceType, sequenceName } =
    useSequencersState((state) => {
      const sequence = state.sequences.find(({ id }) => id === sequenceId)!;

      return {
        currentPatternPageIds: sequence.patterns[sequence.currentPattern].pages.map(({ id }) => id),
        currentPattern: sequence.currentPattern,
        patternIds: sequence.patterns.map(({ id }) => id),
        sequenceType: sequence.type,
        sequenceName: sequence.name,
      };
    }, isEqual);
  const addSequencePattern = useSequencersState((state) => state.addSequencePattern);
  const removeCurrentSequencePattern = useSequencersState(
    (state) => state.removeCurrentSequencePattern
  );
  const addPage = useSequencersState((state) => state.addPage);
  const removePage = useSequencersState((state) => state.removePage);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [visiblePage, setVisiblePage] = useState(0);
  const [stepPropertyCurrentlyBeingEdited, setStepPropertyCurrentlyBeingEdited] = useState<
    keyof StateSequenceStepProperties | null
  >(null);
  const updateSequencePatternOrder = useSequencersState(
    (state) => state.updateSequencePatternOrder
  );
  const updatePageOrder = useSequencersState((state) => state.updatePageOrder);

  const sortingSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const patternSortingHandleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = patternIds.findIndex((id) => id === active.id);
      const newIndex = patternIds.findIndex((id) => id === over?.id);

      updateSequencePatternOrder(sequenceId, oldIndex, newIndex);
    }
  };

  const pageSortingHandleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = currentPatternPageIds.findIndex((id) => id === active.id);
      const newIndex = currentPatternPageIds.findIndex((id) => id === over?.id);

      updatePageOrder(sequenceId, oldIndex, newIndex);

      if (activePageIndex >= newIndex && activePageIndex < oldIndex) {
        setActivePageIndex(activePageIndex + 1);
      } else if (activePageIndex <= newIndex && activePageIndex > oldIndex) {
        setActivePageIndex(activePageIndex - 1);
      } else if (activePageIndex === oldIndex) {
        setActivePageIndex(newIndex);
      }

      if (visiblePage >= newIndex && visiblePage < oldIndex) {
        setVisiblePage(visiblePage + 1);
      } else if (visiblePage <= newIndex && visiblePage > oldIndex) {
        setVisiblePage(visiblePage - 1);
      } else if (visiblePage === oldIndex) {
        setVisiblePage(newIndex);
      }
    }
  };

  return (
    <div className="sequencer">
      <SequencerConfig
        sequenceId={sequenceId}
        sequencerConfigCallback={sequencerConfigCallback}
        tools={[
          {
            name: 'default',
            value: null,
            icon: 'layout-grid',
          },
          {
            name: 'volume',
            value: 'volume',
            icon: 'vertical-bar-chart-asc',
          },
          {
            name: 'pitch',
            value: 'pitch',
            icon: 'music',
            isHidden: sequenceType === 'synth',
          },
          {
            name: 'duration',
            value: 'duration',
            icon: 'arrows-horizontal',
            isHidden: sequenceType !== 'synth',
          },
          {
            name: 'probability',
            value: 'probability',
            icon: 'heatmap',
          },
          {
            name: 'mutability',
            value: 'mutability',
            icon: 'exchange',
          },
        ]}
        selectedTool={stepPropertyCurrentlyBeingEdited}
        onSelectTool={(tool) =>
          setStepPropertyCurrentlyBeingEdited((tool as keyof StateSequenceStepProperties) || null)
        }
        configControls={
          stepPropertyCurrentlyBeingEdited === 'mutability' ? (
            <SequencerConfigMutation sequenceId={sequenceId} />
          ) : undefined
        }
      />
      <div className="sequencer__body">
        <SequencerGrid
          sequenceId={sequenceId}
          channelsConfig={channelsConfig}
          visiblePage={visiblePage}
          stepPropertyCurrentlyBeingEdited={stepPropertyCurrentlyBeingEdited}
          stepPropertyEditDirection={
            stepPropertyCurrentlyBeingEdited === 'duration' ? 'horizontal' : 'vertical'
          }
          triggerCallback={triggerCallback}
          activePageIndex={activePageIndex}
          setActivePageIndex={setActivePageIndex}
          {...otherSequencerChannelProps}
        />
        <div className="sequencer__patterns">
          <DndContext
            sensors={sortingSensors}
            collisionDetection={closestCenter}
            onDragEnd={patternSortingHandleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={patternIds.map((id) => ({ id }))}
              strategy={verticalListSortingStrategy}
            >
              {patternIds.map((id, patternIndex) => (
                <SequencerSortingItem
                  key={id}
                  id={id}
                  text={patternIndex}
                  actionMessage={{
                    type: 'Sequence Param Change',
                    parameter: 'currentPattern',
                    value: patternIndex,
                    sequenceName,
                  }}
                  isActive={currentPattern === patternIndex}
                />
              ))}
            </SortableContext>
          </DndContext>
          <Button icon="plus" onClick={() => addSequencePattern(sequenceId)} />
          <Button icon="duplicate" onClick={() => addSequencePattern(sequenceId, true)} />
          <Button icon="trash" onClick={() => removeCurrentSequencePattern(sequenceId)} />
        </div>
      </div>
      <div className="sequencer__footer">
        <div className="sequencer__pattern-pagination">
          <DndContext
            sensors={sortingSensors}
            collisionDetection={closestCenter}
            onDragEnd={pageSortingHandleDragEnd}
            modifiers={[restrictToHorizontalAxis]}
          >
            <SortableContext
              items={currentPatternPageIds.map((id) => ({ id }))}
              strategy={horizontalListSortingStrategy}
            >
              {currentPatternPageIds.map((id, pageNumber) => (
                <SequencerSortingItem
                  className={classNames('sequencer__pattern-pagination-page', {
                    'sequencer__pattern-pagination-page--is-visible':
                      pageNumber === activePageIndex,
                  })}
                  type="mini"
                  key={id}
                  id={id}
                  onClick={() => setVisiblePage(pageNumber)}
                  isActive={pageNumber === visiblePage}
                />
              ))}
            </SortableContext>
          </DndContext>
          <Button
            icon="plus"
            className="sequencer__pattern-pagination-control"
            onClick={() => addPage(sequenceId)}
            type="mini"
          />
          <Button
            icon="duplicate"
            className="sequencer__pattern-pagination-control"
            onClick={() => addPage(sequenceId, undefined, visiblePage)}
            type="mini"
          />
          <Button
            icon="trash"
            className="sequencer__pattern-pagination-control"
            onClick={() => {
              if (currentPatternPageIds.length < 2) {
                addPage(sequenceId);
              } else {
                setActivePageIndex(activePageIndex % (currentPatternPageIds.length - 1));
                setVisiblePage(visiblePage % (currentPatternPageIds.length - 1));
              }
              removePage(sequenceId, visiblePage);
            }}
            type="mini"
          />
        </div>
      </div>
    </div>
  );
};
