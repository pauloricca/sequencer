class Metronome {
  private func: (scheduledTime: number) => any;
  private interval: number;
	private now: number = -1;
	private nextAt: number = -1;
	private timeout: number = -1;

  constructor(func: (scheduledTime: number) => any, interval: number) {
    this.func = func;
    this.interval = interval;
  }

  private wrapper() {
    const scheduledTime = this.nextAt;
    this.nextAt += this.interval;
		this.timeout = this.scheduleNext();
    this.func(scheduledTime);
  }

	private scheduleNext() {
		return setTimeout(() => this.wrapper(), this.nextAt - new Date().getTime()) as unknown as number;
	}

	public setInterval(newInterval: number) {
		if (this.nextAt !== 0) {
			this.nextAt += (newInterval - this.interval);
		}
		this.interval = newInterval;
		clearTimeout(this.timeout);
		this.timeout = this.scheduleNext();
	}

  public stop() {
		this.nextAt = -1;
    clearTimeout(this.timeout);
  }

	public start() {
		this.now = new Date().getTime();
		this.nextAt = this.now;
		this.timeout = this.scheduleNext();
	}
}

export default Metronome;
