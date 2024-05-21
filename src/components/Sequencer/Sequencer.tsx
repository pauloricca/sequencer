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
require('./_Sequencer.scss');

export const Sequencer: React.FC<SequencerProps> = ({
  sequenceId,
  channelsConfig,
  triggerCallback = () => {},
  sequencerConfigCallback,
  ...otherSequencerChannelProps
}) => {
  const { currentPatternPageLength, patternCount, currentPattern, sequenceType, sequenceName } =
    useSequencersState((state) => {
      const sequence = state.sequences.find(({ id }) => id === sequenceId)!;

      return {
        currentPatternPageLength: sequence.patterns[sequence.currentPattern].pages.length,
        currentPattern: sequence.currentPattern,
        patternCount: sequence.patterns.length,
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
          {[...Array(patternCount).keys()].map((_, patternIndex) => (
            <Button
              text={patternIndex}
              key={patternIndex}
              actionMessage={{
                type: 'Sequence Param Change',
                parameter: 'currentPattern',
                value: patternIndex,
                sequenceName,
              }}
              isActive={currentPattern === patternIndex}
            />
          ))}
          <Button icon="plus" onClick={() => addSequencePattern(sequenceId)} />
          <Button icon="duplicate" onClick={() => addSequencePattern(sequenceId, true)} />
          <Button icon="trash" onClick={() => removeCurrentSequencePattern(sequenceId)} />
        </div>
      </div>
      <div className="sequencer__footer">
        <div className="sequencer__pattern-pagination">
          {[...Array(currentPatternPageLength)].map((_, pageNumber) => (
            <Button
              className={classNames('sequencer__pattern-pagination-page', {
                'sequencer__pattern-pagination-page--is-visible': pageNumber === activePageIndex,
              })}
              key={pageNumber}
              onClick={() => setVisiblePage(pageNumber)}
              isActive={pageNumber === visiblePage}
              style="mini"
            />
          ))}
          <Button
            icon="plus"
            className="sequencer__pattern-pagination-control"
            onClick={() => addPage(sequenceId)}
            style="mini"
          />
          <Button
            icon="duplicate"
            className="sequencer__pattern-pagination-control"
            onClick={() => addPage(sequenceId, undefined, visiblePage)}
            style="mini"
          />
          <Button
            icon="trash"
            className="sequencer__pattern-pagination-control"
            onClick={() => {
              if (currentPatternPageLength < 2) {
                addPage(sequenceId);
              } else {
                setActivePageIndex(activePageIndex % (currentPatternPageLength - 1));
                setVisiblePage(visiblePage % (currentPatternPageLength - 1));
              }
              removePage(sequenceId, visiblePage);
            }}
            style="mini"
          />
        </div>
      </div>
    </div>
  );
};
