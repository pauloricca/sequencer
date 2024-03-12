import { type InstrumentConfigSelectKnobSpeed } from './InstrumentConfigSelectKnob.types';

export const MOUSE_DRAG_RANGE_NORMAL = 800;
export const MOUSE_DRAG_RANGE_FAST = 50;
export const MOUSE_MOUSE_THROTTLE = 150;

export const MOUSE_DRAG_RANGE_SPEEDS: { [key in InstrumentConfigSelectKnobSpeed]: number } = {
  normal: MOUSE_DRAG_RANGE_NORMAL,
  fast: MOUSE_DRAG_RANGE_FAST,
};
