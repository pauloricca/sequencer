import { SelectKnobItem } from 'components/SelectKnob/SelectKnob.types';
import { StateShortcut } from 'state/state.types';

export const PRESS_AND_HOLD_TIME = 1000;

const shortCutTypeOptionValues: StateShortcut['type'][] = ['keyboard', 'midi-note', 'midi-cc'];

export const SHORTCUT_TYPE_OPTIONS: SelectKnobItem[] = [
  { value: undefined, label: '- shortcut type -' },
  ...shortCutTypeOptionValues.map((value) => ({ value })),
];

export const SHORTCUT_EDIT_MODAL_DEPTH = 5;
