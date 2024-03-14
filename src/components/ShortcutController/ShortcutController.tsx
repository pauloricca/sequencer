import { Icon } from '@blueprintjs/core';
import { Modal } from 'components/Modal/Modal';
import React, { useEffect, useState } from 'react';
import { useSequencersState } from 'state/state';
import { StateShortcut } from 'state/state.types';
require('./_ShortcutController.scss');

export const ShortcutController: React.FC = () => {
  const shortcutCurrentlyBeingAssigned = useSequencersState((state) =>
    state.shortcuts.find(({ type }) => type === 'currently-being-assigned')
  );
  const shortcuts = useSequencersState((state) => state.shortcuts);
  const saveNewShortcut = useSequencersState((state) => state.saveNewShortcut);
  const performAction = useSequencersState((state) => state.performAction);
  const removeShortcut = useSequencersState((state) => state.removeShortcut);
  const [keyPressed, setKeyPressed] = useState<{ key: string; code: number }>();

  useEffect(() => {
    document.addEventListener('keypress', (e: KeyboardEvent) => {
      setKeyPressed({ key: e.key, code: e.charCode ?? e.keyCode ?? e.which ?? 0 });
    });
  }, []);

  useEffect(() => {
    if (!keyPressed) return;

    if (!shortcutCurrentlyBeingAssigned) {
      shortcuts
        .filter(({ type, key }) => type === 'keyboard' && key === keyPressed.key)
        .forEach(({ action }) => performAction(action));
    } else {
      saveNewShortcut({
        ...shortcutCurrentlyBeingAssigned,
        action: {
          ...shortcutCurrentlyBeingAssigned.action,
          value: shortcutCurrentlyBeingAssigned.action.value ?? keyPressed.code,
        },
        type: 'keyboard',
        key: keyPressed.key,
      });
    }
  }, [keyPressed]);

  const getActionDecription = (shortcut: StateShortcut) =>
    Object.values(shortcut.action).join(', ');

  return (
    <div className="shortcut-controller">
      <p>Shortcuts</p>
      {shortcuts.map((shortcut, shortcutIndex) => (
        <div className="shortcut-controller__shortcut" key={shortcutIndex}>
          {shortcut.key} – {getActionDecription(shortcut)}
          <Icon
            icon="trash"
            className="shortcut-controller__remove-shortcut-button"
            onClick={() => removeShortcut(shortcut)}
          />
        </div>
      ))}
      <Modal isOpen={!!shortcutCurrentlyBeingAssigned}>
        <div className="shortcut-controller__overlay">
          <p>Press key or change midi controller to save shortcut for:</p>
          <p>
            {!!shortcutCurrentlyBeingAssigned &&
              getActionDecription(shortcutCurrentlyBeingAssigned)}
          </p>
        </div>
      </Modal>
    </div>
  );
};
