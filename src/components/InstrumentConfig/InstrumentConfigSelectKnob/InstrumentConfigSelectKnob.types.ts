export interface InstrumentConfigSelectKnobItem {
  value: any;
	key?: number | string;
  label?: string;
}

export interface InstrumentConfigSelectKnobProps {
  items: InstrumentConfigSelectKnobItem[];
	label: string | number;
	onSelect: (item: InstrumentConfigSelectKnobItem) => void;
}
