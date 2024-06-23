import { ReactNode } from 'react';

export interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  /**
   * Higher depth means higher z-index. This is used for opening a modal from a modal
   */
  depth?: number;
}
