export const getInteractionCoords = (ev: MouseEvent | TouchEvent) => ({
  x: (ev as MouseEvent).screenX ?? (ev as TouchEvent).touches[0].screenX,
  y: (ev as MouseEvent).screenY ?? (ev as TouchEvent).touches[0].screenY,
});

export const lockPageScroll = () => {
  document.body.classList.add('do-not-scroll-while-interacting');
};

export const unlockPageScroll = () => {
  document.body.classList.remove('do-not-scroll-while-interacting');
};
