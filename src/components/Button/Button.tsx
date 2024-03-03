import React, { ReactNode } from 'react';
require('./_Button.scss');

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick = () => {},
}) => {
  return (
    <div className="button" onClick={onClick}>
      {children}
    </div>
  );
};
