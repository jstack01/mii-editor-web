import {randomizeWii,wiiIds,type WiiIdAllocator} from '../compatibility/wiiProfile';
/** Original Wii Mii data model. Source: mii/MiiCharacterData.as and values/*.as.
 * Binary loads preserve all 592 bits; individual edits change only their bit field.
 */
import { MII_FIELDS } from '../generated/mii-schema';
import { MiiDataValue, asInt } from './MiiDataValue';
import { valueToFrame, frameToValue } from './featureOrder';
import { applyMiiXML, serializeMiiXML, parseXMLDocument } from './miiXml';
export { MII_FIELDS, MII_VALUE_NAMES, MII_PERMUTATIONS } from '../generated/mii-schema';
export type { NumericField } from '../generated/mii-schema';

export const MII_WORD_COUNT = 37;
export const MII_BYTE_LENGTH = MII_WORD_COUNT * 2;
export const MII_NAME_WORD_OFFSET = 1;
export const MII_NAME_CODE_UNITS = 10;
type ComplexName = 'name' | 'creator' | 'id' | 'wii';

export class MiiCharacterData {
  private readonly words = new Uint16Array(MII_WORD_COUNT);
  private readonly values = new Map<string, MiiDataValue | MiiDataValue[]>();

  constructor() {
    for (const [name, field] of Object.entries(MII_FIELDS)) {
      this.values.set(name, new MiiDataValue(this.words, field.word, field.shift, field.width, field.min, field.max));
    }
    for (const [name, word, shift, width, length] of [
      ['name', 1, 0, 16, 10], ['creator', 27, 0, 16, 10], ['id', 12, 8, 8, 4], ['wii', 14, 8, 8, 4],
    ] as const) {
      const values: MiiDataValue[] = [];
      let index = word as number;
      let bit = shift as number;
      for (let n = 0; n < length; n += 1) {
        values.push(new MiiDataValue(this.words, index, bit, width));
        bit -= width;
        if (bit < 0) { index += 1; bit += 16; }
      }
      this.values.set(name, values);
    }
  }

  static fromBytes(bytes: Uint8Array): MiiCharacterData {
    if (bytes.byteLength !== MII_BYTE_LENGTH) throw new RangeError(`Expected exactly ${MII_BYTE_LENGTH} bytes, received ${bytes.byteLength}.`);
    const model = new MiiCharacterData();
    model.parseByteData(bytes);
    return model;
  }
  /** Strict internal decoder. Deliberately distinct from legacy setHexData(). */
  static fromHex(hex: string): MiiCharacterData {
    if (hex.length !== MII_BYTE_LENGTH * 2 || !/^[0-9a-fA-F]+$/.test(hex)) throw new TypeError('Expected exactly 148 hexadecimal characters.');
    const bytes = Uint8Array.from({ length: MII_BYTE_LENGTH }, (_, index) => Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16));
    return MiiCharacterData.fromBytes(bytes);
  }
  static fromXML(input: string | Element | Document): MiiCharacterData {
    const model = new MiiCharacterData();
    model.parseXMLData(input);
    return model;
  }
  parseByteData(bytes: Uint8Array): boolean {
    if (bytes.byteLength !== MII_BYTE_LENGTH) return false;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let index = 0; index < MII_WORD_COUNT; index += 1) this.words[index] = view.getUint16(index * 2, false);
    return true;
  }
  /** Original permissive import: AS3 global match returns [] for no matches. */
  setHexData(hex: string): void {
    if (!hex) return;
    const tokens = hex.match(/[0-9a-zA-Z]{1,2}/g) ?? [];
    this.parseByteData(Uint8Array.from({ length: MII_BYTE_LENGTH }, (_, i) => asInt(Number.parseInt(tokens[i] ?? '0', 16))));
  }
  /** Original generic dispatch, including silent failure and partial XML mutation. */
  setData(data: unknown): void {
    try {
      if (data instanceof Uint8Array) this.parseByteData(data);
      else if (typeof data === 'string') {
        if (Number.isNaN(Number.parseInt(data, 16))) this.parseXMLData(data);
        else this.setHexData(data);
      } else if (data && typeof data === 'object' && 'nodeType' in data) this.parseXMLData(data as Element | Document);
    } catch { /* Source setData swallows errors; it does not roll back. */ }
  }
  toWords(): Uint16Array { return this.words.slice(); }
  toBytes(): Uint8Array {
    const bytes = new Uint8Array(MII_BYTE_LENGTH);
    const view = new DataView(bytes.buffer);
    for (let i = 0; i < this.words.length; i += 1) view.setUint16(i * 2, this.words[i]!, false);
    return bytes;
  }
  getData(): Uint8Array { return this.toBytes(); }
  toHex(): string { return Array.from(this.toBytes(), (b) => b.toString(16).padStart(2, '0')).join(''); }
  getHexData(): string { return this.toHex(); }
  getMiiValue(name: string): MiiDataValue | MiiDataValue[] | null { return this.values.get(name) ?? null; }
  getValue(name: 'name' | 'creator'): string;
  getValue(name: 'id' | 'wii'): number[];
  getValue(name: keyof typeof MII_FIELDS): number;
  getValue(name: string): number | string | number[] | null;
  getValue(name: string): number | string | number[] | null {
    if (name === 'name' || name === 'creator') return this.getString(name);
    const value = this.values.get(name);
    return value instanceof MiiDataValue ? value.value : value?.map((v) => v.value) ?? null;
  }
  setValue(name: string, value: unknown): boolean {
    if (name === 'name' || name === 'creator') return this.setString(name, String(value));
    if (name === 'id' || name === 'wii') return this.setHex(name, String(value));
    const field = this.values.get(name);
    if (!(field instanceof MiiDataValue)) return false;
    field.value = asInt(value);
    return true;
  }
  getString(name: string): string {
    const fields = this.values.get(name);
    return Array.isArray(fields) ? fields.filter((v) => v.value !== 0).map((v) => String.fromCharCode(v.value)).join('') : '';
  }
  setString(name: string, text: string): boolean {
    const fields = this.values.get(name);
    if (!Array.isArray(fields)) return false;
    for (let i = 0; i < MII_NAME_CODE_UNITS; i += 1) {
      const field = fields[i];
      if (field) field.value = i < text.length ? text.charCodeAt(i) : 0;
    }
    return true;
  }
  get name(): string { return this.getString('name'); }
  set name(value: string) { this.setString('name', value); }
  get creator(): string { return this.getString('creator'); }
  set creator(value: string) { this.setString('creator', value); }
  get id(): number[] { return this.getValue('id'); }
  get wii(): number[] { return this.getValue('wii'); }
  setHex(name: string, text: string): boolean {
    const fields = this.values.get(name);
    if (!Array.isArray(fields)) return false;
    const tokens = text.match(/[0-9a-zA-Z]{1,2}/g) ?? [];
    if (tokens.length < fields.length) return false;
    for (let i = fields.length - 1; i >= 0; i -= 1) fields[i]!.value = asInt(Number.parseInt(tokens[i]!, 16));
    return true;
  }
  /** Preserve source bug: byte values 10–15 format as a–f, not 0a–0f. */
  getHex(name: string, fill = ''): string {
    const values = this.getValue(name);
    return Array.isArray(values) ? values.map((v) => fill || (v < 10 ? '0' : '') + v.toString(16)).join('-') : '';
  }
  getFrame(name: string): number {
    const value = this.getValue(name);
    return typeof value === 'number' ? valueToFrame(name, value) : 0;
  }
  frameToValue(name: string, frame: number): number { return frameToValue(name, frame); }
  randomize(rng:()=>number=Math.random,ids:WiiIdAllocator=wiiIds):void {randomizeWii(this,rng,ids);}
  /** Internal reset used ONLY by the legacy XML import path. */
  defaultBlocks(): void { this.words.fill(0); }
  toXMLString(): string { return serializeMiiXML(this, true); }
  getXMLData(): Element { return parseXMLDocument(serializeMiiXML(this, false)); }
  parseXMLData(input: string | Element | Document): boolean { return applyMiiXML(this, input); }
  /** String overload swallows errors in AS3; existing XML-object overload does not. */
  setXMLData(input: string | Element | Document): void {
    if (typeof input !== 'string') { this.parseXMLData(input); return; }
    try { this.parseXMLData(input); } catch { /* Preserve reset/partial changes on failure. */ }
  }
  toString(): string { return '[object MiiCharacterData]'; }
}

export type { ComplexName };
