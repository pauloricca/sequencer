import { useEffect, useRef, useState } from 'react';

class Metronome {
  private readonly func: (scheduledTime: number) => any;
  private interval: number;
  private swing: number;
  private isDownBeat: boolean;
  private now: number = -1;
  private nextAt: number = -1;
  private timeout: number = -1;

  constructor(func: (scheduledTime: number) => any, interval: number, swing = 0.5) {
    this.func = func;
    this.interval = interval;
    this.isDownBeat = true;
    this.swing = swing;
  }

  private wrapper() {
    const scheduledTime = this.nextAt;

    const swingTimeShift = this.swing > 0.5 ? this.interval * (this.swing - 0.5) * 2 : 0;

    this.nextAt += this.interval + (this.isDownBeat ? -swingTimeShift : swingTimeShift);
    this.isDownBeat = !this.isDownBeat;
    this.timeout = this.scheduleNext();
    this.func(scheduledTime);
  }

  private scheduleNext() {
    return setTimeout(
      () => this.wrapper(),
      this.nextAt - new Date().getTime()
    ) as unknown as number;
  }

  public setSwing(swing: number) {
    this.swing = swing;
  }

  public setInterval(newInterval: number) {
    this.interval = newInterval;

    if (this.nextAt >= 0) {
      this.nextAt += newInterval - this.interval;
      clearTimeout(this.timeout);
      this.timeout = this.scheduleNext();
    }
  }

  public stop() {
    this.nextAt = -1;
    this.isDownBeat = true;
    clearTimeout(this.timeout);
  }

  public start() {
    this.now = new Date().getTime();
    this.nextAt = this.now;
    this.timeout = this.scheduleNext();
  }
}

let clock = -1;

let metronomeListeners: Array<(clock: number) => void> = [];

const metronome = new Metronome(
  () => setClock(clock + 1),
  1000 // arbitrary interval to initialise the metronome by
);

export const setMetronomeInterval = (interval: number) => {
  metronome.setInterval(interval);
};

export const setMetronomeSwing = (swing: number) => {
  metronome.setSwing(swing);
};

export const startMetronome = () => {
  metronome.start();
};

export const stopMetronome = () => {
  metronome.stop();
  setClock(-1);
};

const setClock = (clockTime: number) => {
  clock = clockTime;
  metronomeListeners.forEach((listener) => listener(clock));
};

// tickLength is the number of clock units necessary to advance 1 tick
export const useMetronome = (tickLength: number) => {
  const [tick, setTick] = useState(-1);
  const tickLengthRef = useRef(tickLength);

  tickLengthRef.current = tickLength;

  useEffect(() => {
    const metronomeHandler = () =>
      setTick(clock === -1 ? clock : Math.floor(clock / tickLengthRef.current));

    metronomeListeners.push(metronomeHandler);

    return () => {
      metronomeListeners = metronomeListeners.filter((listener) => listener !== metronomeHandler);
    };
  }, []);

  return tick;
};
