import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ModalProps } from './Modal.types';
import { Icon } from '@blueprintjs/core';
require('./_Modal.scss');

export const Modal: React.FC<ModalProps> = ({ children, isOpen, onClose = () => {} }) => {
  const container = useRef<HTMLElement>();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-is-open');
    } else {
      document.body.classList.remove('modal-is-open');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (!container.current) {
    container.current = document.createElement('div');
    document.body.append(container.current);
  }

  return createPortal(
    <div className="modal" onClick={onClose}>
      <Icon className="modal__close-btn" icon="cross" />
      <div className="modal__inner" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>,
    container.current
  );
};
