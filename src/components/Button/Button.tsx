import { Icon } from '@blueprintjs/core';
import classNames from 'classnames';
import { PRESS_AND_HOLD_TIME } from 'components/ShortcutController/ShortcutController.constants';
import React, { MouseEventHandler, useState } from 'react';
import { useSequencersState } from 'state/state';
import { ButtonProps } from './Button.types';
require('./_Button.scss');

export const Button: React.FC<ButtonProps> = ({
  children,
  text,
  className,
  icon,
  isIconOnTheLeft,
  onClick,
  isActive,
  isDisabled,
  actionMessage,
  actionMessageDecimalPlaces,
  type = 'normal',
  style,
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
        `button--style-${type}`,
        { 'button--is-active': isActive },
        { 'button--is-disabled': isDisabled },
        { 'button--is-icon-on-the-left': isIconOnTheLeft },
        { 'button--icon-only': !children && !text && icon },
        className
      )}
      onClick={!isDisabled && !isListeningForShortcut ? onClickHandler : undefined}
      onMouseDown={!isDisabled && actionMessage ? onMouseDownHandler : undefined}
      style={style}
    >
      {(!!text || !!children) && (
        <div className="button__content">
          {text}
          {children}
        </div>
      )}
      {!!icon && (
        <div className="button__icon">
          <Icon icon={icon} />
        </div>
      )}
    </div>
  );
};
