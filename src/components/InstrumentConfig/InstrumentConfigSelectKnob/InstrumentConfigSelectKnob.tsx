import React, { useState } from 'react';
import { InstrumentConfigSelectKnobProps } from './InstrumentConfigSelectKnob.types';
import { Icon } from '@blueprintjs/core';
import { Modal } from 'components/Modal/Modal';
import { Button } from 'components/Button/Button';
require('./_InstrumentConfigSelectKnob.scss');

export const InstrumentConfigSelectKnob: React.FC<InstrumentConfigSelectKnobProps> = ({
  type,
  items,
  label,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="instrument-config-select-knob">
        <Button onClick={() => { setIsOpen(true); }}>
          {label}
          <Icon icon="double-caret-vertical" />
        </Button>
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="instrument-config-select-knob__modal-contents">
          {items.map((item) => (
            <Button
              onClick={() => {
                // setIsOpen(false);
                onChange(item);
              }}
              key={item.key ?? item.label ?? item.value}
            >
              {item.label ?? item.value}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
};
