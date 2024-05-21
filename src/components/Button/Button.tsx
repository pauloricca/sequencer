import { Icon } from '@blueprintjs/core';
import classNames from 'classnames';
import { PRESS_AND_HOLD_TIME } from 'components/ShortcutController/ShortcutController.constants';
import React, { MouseEventHandler, ReactNode, useState } from 'react';
import { useSequencersState } from 'state/state';
import { StateActionMessage } from 'state/state.types';
require('./_Button.scss');

interface ButtonProps {
  children?: ReactNode;
  text?: ReactNode;
  className?: string;
  icon?: string;
  onClick?: () => void;
  isActive?: boolean;
  actionMessage?: StateActionMessage;
  actionMessageDecimalPlaces?: number;
  style?: 'normal' | 'mini';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  text,
  className,
  icon,
  onClick,
  isActive,
  actionMessage,
  actionMessageDecimalPlaces,
  style = 'normal',
}) => {
  const [isListeningForShortcut, setIsListeningForShortcut] = useState(false);
  const performAction = useSequencersState((state) => state.performAction);
  const startListeningToNewShortcut = useSequencersState((state) => state.startEditingShortcut);

  const onMouseDownHandler: MouseEventHandler = () => {
    if (!actionMessage) return;

    const pressAndHoldCounterTimeout = setTimeout(() => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      setIsListeningForShortcut(true);
      startListeningToNewShortcut({ actionMessage, decimalPlaces: actionMessageDecimalPlaces });
    }, PRESS_AND_HOLD_TIME);

    const mouseMoveHandler = () => {
      clearInterval(pressAndHoldCounterTimeout);
    };

    const mouseUpHandler = () => {
      clearInterval(pressAndHoldCounterTimeout);

      // Delay setting isDragging to false so that we can avoid triggering the onClick handler
      setTimeout(() => {
        setIsListeningForShortcut(false);
      }, 100);

      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  };

  const onClickHandler = () => {
    onClick && onClick();
    actionMessage && performAction(actionMessage);
  };

  return (
    <div
      className={classNames(
        'button',
        `button--style-${style}`,
        { 'button--is-active': isActive },
        className
      )}
      onClick={!isListeningForShortcut ? onClickHandler : undefined}
      onMouseDown={actionMessage ? onMouseDownHandler : undefined}
    >
      {text}
      {children}
      {icon && <Icon icon={icon} />}
    </div>
  );
};
