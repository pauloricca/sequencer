import React, { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
require('./_Modal.scss');

interface ModalProps {
  children: ReactNode
  isOpen: boolean
  onClose?: () => void
}

export const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose = () => {},
}) => {
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
      <div className="modal__inner" onClick={(event) => event.stopPropagation()}>{children}</div>
    </div>,
    container.current
  );
};
