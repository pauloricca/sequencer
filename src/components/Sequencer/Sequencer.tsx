import React, { useState } from 'react';
import { SequencerChannelProps } from './SequencerChannel/SequencerChannel';
import { StateSequenceChannelConfigCommon, StateSequenceStepProperties } from 'state/state.types';
import { Button } from '@blueprintjs/core';
import { useSequencersState } from 'state/state';
import {
  SequencerConfig,
  SequencerConfigProps,
} from 'components/Sequencer/SequencerConfig/SequencerConfig';
import classNames from 'classnames';
import { SequencerGrid } from './SequencerGrid/SequencerGrid';
import { isEqual } from 'lodash';
require('./_Sequencer.scss');

export interface SequencerProps
  extends Pick<
      SequencerChannelProps,
      'triggerCallback' | 'showChannelControls' | 'channelConfigComponents'
    >,
    Pick<SequencerConfigProps, 'sequencerConfigCallback'> {
  sequenceName: string;
  channelsConfig: StateSequenceChannelConfigCommon[];
}

export const Sequencer: React.FC<SequencerProps> = ({
  sequenceName,
  channelsConfig,
  triggerCallback = () => {},
  sequencerConfigCallback,
  ...otherSequencerChannelProps
}) => {
  const { currentPatternPageLength, patternCount, currentPattern } = useSequencersState((state) => {
    const sequence = state.sequences.find(({ name }) => name === sequenceName)!;

    return {
      currentPatternPageLength: sequence.patterns[sequence.currentPattern].pages.length,
      currentPattern: sequence.currentPattern,
      patternCount: sequence.patterns.length,
    };
  }, isEqual);
  const updateSequence = useSequencersState((state) => state.updateSequence);
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
        sequenceName={sequenceName}
        sequencerConfigCallback={sequencerConfigCallback}
        tools={[
          {
            name: 'default',
            value: null,
            icon: 'heat-grid',
          },
          {
            name: 'volume',
            value: 'volume',
            icon: 'vertical-bar-chart-asc',
          },
          {
            name: 'probability',
            value: 'probability',
            icon: 'heatmap',
          },
        ]}
        selectedTool={stepPropertyCurrentlyBeingEdited}
        onSelectTool={(tool) =>
          setStepPropertyCurrentlyBeingEdited((tool as keyof StateSequenceStepProperties) || null)
        }
      />
      <div className="sequencer__body">
        <SequencerGrid
          sequenceName={sequenceName}
          channelsConfig={channelsConfig}
          visiblePage={visiblePage}
          stepPropertyCurrentlyBeingEdited={stepPropertyCurrentlyBeingEdited}
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
              onClick={() => updateSequence(sequenceName, { currentPattern: patternIndex })}
              active={currentPattern === patternIndex}
            />
          ))}
          <Button icon="plus" onClick={() => addSequencePattern(sequenceName)} />
          <Button icon="duplicate" onClick={() => addSequencePattern(sequenceName, true)} />
          <Button icon="trash" onClick={() => removeCurrentSequencePattern(sequenceName)} />
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
              active={pageNumber === visiblePage}
            />
          ))}
          <Button
            icon="plus"
            className="sequencer__pattern-pagination-control"
            onClick={() => addPage(sequenceName)}
          />
          <Button
            icon="duplicate"
            className="sequencer__pattern-pagination-control"
            onClick={() => addPage(sequenceName, undefined, visiblePage)}
          />
          <Button
            icon="trash"
            className="sequencer__pattern-pagination-control"
            onClick={() => {
              if (currentPatternPageLength < 2) {
                addPage(sequenceName);
              } else {
                setActivePageIndex(activePageIndex % (currentPatternPageLength - 1));
                setVisiblePage(visiblePage % (currentPatternPageLength - 1));
              }
              removePage(sequenceName, visiblePage);
            }}
          />
        </div>
      </div>
    </div>
  );
};
