export interface InstrumentConfigSelectItem {
  value: any;
	key: number | string;
  label: string;
}

export interface InstrumentConfigSelectProps {
  items: InstrumentConfigSelectItem[];
	label: string | number;
	onSelect: (item: InstrumentConfigSelectItem) => void;
}
