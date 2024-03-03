export interface InstrumentConfigSelectKnobItem {
  value: any
  key?: number | string
  label?: string
}

export interface InstrumentConfigSelectKnobProps extends InstrumentConfigSelectKnobPropsDiscrete {
  label: string | number
}

export interface InstrumentConfigSelectKnobPropsDiscrete {
  type: 'discrete'
  items: InstrumentConfigSelectKnobItem[]
  onChange: (item: InstrumentConfigSelectKnobItem) => void
}

export type InstrumentConfigSelectKnobSpeed = 'normal' | 'fast';

export interface InstrumentConfigSelectKnobPropsNumeric {
  type: 'numeric'
  value: number
  min?: number
  max?: number
  isIntegerOnly?: boolean
  speed?: InstrumentConfigSelectKnobSpeed
  onChange: (value: number) => void
}
