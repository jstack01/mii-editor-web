/** Direct arithmetic port of mii/values/Range.as, including NaN and zero-span behavior. */
export class Range {
  constructor(public min = 0, public max = 0) {}
  get span(): number { return this.max - this.min; }
  normalize(): void { if (this.min > this.max) [this.min, this.max] = [this.max, this.min]; }
  clamp(value: number): number {
    if (value < this.min) return this.min;
    if (value > this.max) return this.max;
    return value;
  }
  percentAt(value: number): number { return (this.clamp(value) - this.min) / this.span; }
  valueAt(percent: number, integer = false): number {
    return this.clamp(this.min + (integer ? Math.floor((this.span + 1) * percent) : this.span * percent));
  }
  stepValue(value: number, steps: number): number {
    steps = Number(steps) | 0; // Source parameter type is int.
    const clamped = this.clamp(value);
    if (value !== clamped) return clamped;
    if (steps < 2) steps = 2;
    const interval = this.span / (steps - 1);
    return this.min + Math.round((value - this.min) / interval) * interval;
  }
}
