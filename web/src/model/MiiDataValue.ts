import { Range } from './Range';

/** AS3 int(value): truncate/wrap signed 32-bit; NaN and infinities become zero. */
export function asInt(value: unknown): number { return Number(value) | 0; }

/** Bit view of existing storage. Reading must never normalize invalid loaded bits. */
export class MiiDataValue extends Range {
  private readonly mask: number;
  constructor(private readonly words: Uint16Array, private readonly index: number,
    private readonly shift = 0, private readonly width = 16, min = 0, max = 0) {
    super(min, max || 2 ** width - 1);
    this.mask = 2 ** width - 1;
    this.normalize();
  }
  get value(): number { return (this.words[this.index]! >>> this.shift) & this.mask; }
  set value(value: number) {
    const next = this.clamp(asInt(value));
    const mask = this.mask << this.shift;
    this.words[this.index] = (this.words[this.index]! & ~mask) | (next << this.shift);
  }
  getValuePercent(): number { return (this.value - this.min) / this.span; }
  randomize(rng: () => number = Math.random): void { this.value = this.valueAt(rng(), true); }
  toString(): string { return this.value.toString(2).padStart(this.width, '0'); }
}
