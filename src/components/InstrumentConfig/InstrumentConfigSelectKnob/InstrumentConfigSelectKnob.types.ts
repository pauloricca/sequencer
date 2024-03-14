import { StateActionMessage } from 'state/state.types';

export interface InstrumentConfigSelectKnobItem {
  value: any;
  key?: number | string;
  label?: string;
}

export interface InstrumentConfigSelectKnobProps {
  label: string;
  type: 'discrete' | 'numeric';
  value: any;
  onChange?: (value: any, item?: InstrumentConfigSelectKnobItem) => void;
  actionMessage?: StateActionMessage;
  items?: InstrumentConfigSelectKnobItem[];
  min?: number;
  max?: number;
  speed?: number;
  step?: number;
  showDial?: boolean;
  clickOnModalButtonClosesModal?: boolean;
}
