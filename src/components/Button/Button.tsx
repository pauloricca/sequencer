import classNames from 'classnames';
import React, { ReactNode } from 'react';
require('./_Button.scss');

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick = () => {}, isActive }) => {
  return (
    <div className={classNames('button', { 'button--is-active': isActive })} onClick={onClick}>
      {children}
    </div>
  );
};
