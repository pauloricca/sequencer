export const getInteractionCoords = (ev: MouseEvent | TouchEvent) => ({
  x: (ev as MouseEvent).screenX ?? (ev as TouchEvent).touches[0].screenX,
  y: (ev as MouseEvent).screenY ?? (ev as TouchEvent).touches[0].screenY,
});
