import { HTMLAttributes, ReactNode } from 'react';
import { StateActionMessage } from 'state/state.types';

export interface ButtonProps extends Pick<HTMLAttributes<HTMLDivElement>, 'style'> {
  children?: ReactNode;
  text?: ReactNode;
  className?: string;
  icon?: string;
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean | undefined;
  actionMessage?: StateActionMessage;
  actionMessageDecimalPlaces?: number;
  type?: 'normal' | 'mini';
}
