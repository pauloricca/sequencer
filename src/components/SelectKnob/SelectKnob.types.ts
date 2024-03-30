import { StateActionMessage } from 'state/state.types';

export interface SelectKnobItem {
  value: any;
  key?: number | string;
  label?: string;
}

export interface SelectKnobProps {
  label: string;
  type: 'discrete' | 'numeric';
  value: any;
  onChange?: (value: any, item?: SelectKnobItem) => void;
  actionMessage?: StateActionMessage;
  items?: SelectKnobItem[];
  min?: number;
  max?: number;
  speed?: number;
  step?: number;
  showDial?: boolean;
  clickOnModalButtonClosesModal?: boolean;
  modalColumns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
}
