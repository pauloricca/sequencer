import React, { useEffect, useState } from 'react';
import { SequencerChannelProps } from './SequencerChannel/SequencerChannel';
import {
  StateSequence,
  StateSequenceChannelConfigCommon,
  StateSequenceStepProperties,
} from 'state/state.types';
import { registerMidiDevice } from 'utils/midi';
import { Button } from '@blueprintjs/core';
import { useSequencersState } from 'state/state';
import { cloneDeep } from 'lodash';
import {
  InstrumentConfig,
  InstrumentConfigProps,
} from 'components/InstrumentConfig/InstrumentConfig';
import { getBlankPattern } from 'state/state.utils';
import classNames from 'classnames';
import { SequencerGrid } from './SequencerGrid/SequencerGrid';
require('./_Sequencer.scss');

export interface SequencerProps
  extends Pick<
      SequencerChannelProps,
      'triggerCallback' | 'showChannelControls' | 'channelConfigComponents'
    >,
    Pick<InstrumentConfigProps, 'instrumentConfigCallback'> {
  sequence: StateSequence;
  channelsConfig: StateSequenceChannelConfigCommon[];
}

export const Sequencer: React.FC<SequencerProps> = ({
  sequence,
  channelsConfig,
  triggerCallback = () => {},
  instrumentConfigCallback,
  ...otherSequencerChannelProps
}) => {
  const updateSequence = useSequencersState((state) => state.updateSequence(sequence.name));
  const addPage = useSequencersState((state) => state.addPage(sequence.name));
  const removePage = useSequencersState((state) => state.removePage(sequence.name));
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [visiblePage, setVisiblePage] = useState(0);
  const [stepPropertyCurrentlyBeingEdited, setStepPropertyCurrentlyBeingEdited] = useState<
    keyof StateSequenceStepProperties | null
  >(null);

  useEffect(() => {
    if (sequence.midiOutDeviceName) {
      registerMidiDevice(sequence.midiOutDeviceName, 'output');
    }
  }, [sequence.midiOutDeviceName]);

  return (
    <div className="sequencer">
      <InstrumentConfig
        sequence={sequence}
        instrumentConfigCallback={instrumentConfigCallback}
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
          sequence={sequence}
          channelsConfig={channelsConfig}
          visiblePage={visiblePage}
          stepPropertyCurrentlyBeingEdited={stepPropertyCurrentlyBeingEdited}
          triggerCallback={triggerCallback}
          activePageIndex={activePageIndex}
          setActivePageIndex={setActivePageIndex}
          {...otherSequencerChannelProps}
        />
        <div className="sequencer__patterns">
          {sequence.patterns.map((_, patternIndex) => (
            <Button
              text={patternIndex}
              key={patternIndex}
              onClick={() => updateSequence({ currentPattern: patternIndex })}
              active={sequence.currentPattern === patternIndex}
            />
          ))}
          <Button
            icon="plus"
            onClick={() =>
              updateSequence({
                patterns: [...sequence.patterns, getBlankPattern()],
                currentPattern: sequence.patterns.length,
              })
            }
          />
          <Button
            icon="duplicate"
            onClick={() =>
              updateSequence({
                patterns: [
                  ...sequence.patterns,
                  cloneDeep(sequence.patterns[sequence.currentPattern]),
                ],
                currentPattern: sequence.patterns.length,
              })
            }
          />
          <Button
            icon="trash"
            onClick={() =>
              updateSequence({
                patterns:
                  sequence.patterns.length > 1
                    ? sequence.patterns.filter((_, index) => index !== sequence.currentPattern)
                    : [getBlankPattern()],
                currentPattern: Math.max(0, sequence.currentPattern - 1),
              })
            }
          />
        </div>
      </div>
      <div className="sequencer__footer">
        <div className="sequencer__pattern-pagination">
          {[...Array(sequence.patterns[sequence.currentPattern].pages.length)].map(
            (_, pageNumber) => (
              <Button
                className={classNames('sequencer__pattern-pagination-page', {
                  'sequencer__pattern-pagination-page--is-visible': pageNumber === activePageIndex,
                })}
                key={pageNumber}
                onClick={() => setVisiblePage(pageNumber)}
                active={pageNumber === visiblePage}
              />
            )
          )}
          <Button
            icon="plus"
            className="sequencer__pattern-pagination-control"
            onClick={() => addPage()}
          />
          <Button
            icon="duplicate"
            className="sequencer__pattern-pagination-control"
            onClick={() => addPage(sequence.patterns[sequence.currentPattern].pages[visiblePage])}
          />
          <Button
            icon="trash"
            className="sequencer__pattern-pagination-control"
            onClick={() => {
              if (sequence.patterns[sequence.currentPattern].pages.length < 2) {
                addPage();
              } else {
                setActivePageIndex(
                  activePageIndex % (sequence.patterns[sequence.currentPattern].pages.length - 1)
                );
                setVisiblePage(
                  visiblePage % (sequence.patterns[sequence.currentPattern].pages.length - 1)
                );
              }
              removePage(visiblePage);
            }}
          />
        </div>
      </div>
    </div>
  );
};
