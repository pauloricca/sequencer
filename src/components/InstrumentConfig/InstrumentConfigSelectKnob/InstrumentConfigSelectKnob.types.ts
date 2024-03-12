export interface InstrumentConfigSelectKnobItem {
  value: any;
  key?: number | string;
  label?: string;
}

export interface InstrumentConfigSelectKnobProps {
  label: string;
  onChange: (value: any, item?: InstrumentConfigSelectKnobItem) => void;
  type: 'discrete' | 'numeric';
  value: any;
  items?: InstrumentConfigSelectKnobItem[];
  min?: number;
  max?: number;
  speed?: InstrumentConfigSelectKnobSpeed;
  step?: number;
  clickOnModalButtonClosesModal?: boolean;
}

export type InstrumentConfigSelectKnobSpeed = 'normal' | 'fast';
