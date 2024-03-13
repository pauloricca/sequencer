import { Modal } from 'components/Modal/Modal';
import React from 'react';
import { useSequencersState } from 'state/state';
require('./_ShortcutController.scss');

export const ShortcutController: React.FC = () => {
  const actionCurrentlyListeningForShortcut = useSequencersState(
    (state) => state.actionCurrentlyListeningForShortcut
  );
  const shortcuts = useSequencersState((state) => state.shortcuts);

  return (
    <div className="shortcut-controller">
      {shortcuts.map((shortcut, shortcutIndex) => (
        <div className="shortcut-controller__shortcut" key={shortcutIndex}>
          {shortcut.key} – {shortcut.action.type}
        </div>
      ))}
      <Modal isOpen={!!actionCurrentlyListeningForShortcut}>
        <div className="shortcut-controller__overlay"></div>
      </Modal>
    </div>
  );
};
