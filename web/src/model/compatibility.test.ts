import {legacyRandomize} from '../../test-support/legacyRandomize';
import { describe, expect, it } from 'vitest';
import source from '../../../EXTRACTED-SWF/classicGUI.swf/scripts/mii/MiiCharacterData.as?raw';
import { MiiCharacterData, MII_FIELDS, MII_VALUE_NAMES, MII_PERMUTATIONS } from './MiiCharacterData';
import { MiiDataValue, asInt } from './MiiDataValue';
import { Range } from './Range';
import { valueToFrame, frameToValue } from './featureOrder';
import { DEFAULT_MII_HEX } from '../generated/default-character';

// Independently read source declarations rather than using the generated schema as oracle.
const constants = new Map([...source.matchAll(/const (\w+):int = (\d+)/g)].map((m) => [m[1]!, Number(m[2])]));
const sourceFields = source.split(/\r?\n/).filter((line) => line.trim().startsWith('defineValue("')).map((line) => {
  const parts = line.slice(line.indexOf('(') + 1, line.lastIndexOf(')')).split(',');
  const name = parts.shift()!.replaceAll('"', '') as keyof typeof MII_FIELDS;
  const args = parts.map((s) => constants.get(s) ?? Number(s));
  return { name, word: args[0]!, shift: args[1]!, width: args[2] ?? 1, min: args[3] ?? 0, max: args[4] || 2 ** (args[2] ?? 1) - 1 };
});
const patterned = () => Uint8Array.from({ length: 74 }, (_, i) => (i * 97 + 83) & 255);
const uint = (bytes: Uint8Array, word: number) => bytes[word * 2]! * 256 + bytes[word * 2 + 1]!;

it('schema and value iteration order are exactly the ActionScript declarations', () => {
  expect(sourceFields).toHaveLength(45);
  expect(Object.keys(MII_FIELDS)).toHaveLength(45);
  for (const { name, ...field } of sourceFields) expect(MII_FIELDS[name]).toEqual(field);
  expect(MII_VALUE_NAMES).toEqual(JSON.parse(source.match(/valueNames:Array = (\[[^;]+\]);/)![1]!));
});

for (const field of sourceFields) describe(field.name, () => {
  const mask = (2 ** field.width - 1) * 2 ** field.shift;
  it('reads the original bit position, even above declared bounds', () => {
    for (const fill of [0, 255]) {
      const bytes = new Uint8Array(74).fill(fill);
      const model = MiiCharacterData.fromBytes(bytes);
      expect(model.getValue(field.name)).toBe(fill ? 2 ** field.width - 1 : 0);
      expect(model.toBytes()).toEqual(bytes);
    }
    const bytes = patterned();
    expect(MiiCharacterData.fromBytes(bytes).getValue(field.name)).toBe(Math.floor(uint(bytes, field.word) / 2 ** field.shift) % 2 ** field.width);
  });
  it('writes every allowed value and clamps both limits without disturbing any other bit', () => {
    for (const initial of [patterned(), new Uint8Array(74).fill(255)]) {
      for (let value = field.min - 1; value <= field.max + 1; value += 1) {
        const expected = initial.slice();
        const original = uint(initial, field.word);
        const clamped = Math.max(field.min, Math.min(field.max, value));
        // Arithmetic oracle, independent of the production bit-operation code.
        const clear = original - (Math.floor(original / 2 ** field.shift) % 2 ** field.width) * 2 ** field.shift;
        const next = clear + clamped * 2 ** field.shift;
        expected[field.word * 2] = Math.floor(next / 256);
        expected[field.word * 2 + 1] = next % 256;
        const model = MiiCharacterData.fromBytes(initial);
        expect(model.setValue(field.name, value)).toBe(true);
        expect(model.getValue(field.name)).toBe(clamped);
        expect(model.toBytes()).toEqual(expected);
        expect((uint(model.toBytes(), field.word) ^ original) & ~mask).toBe(0);
        expect(MiiCharacterData.fromHex(model.toHex()).toBytes()).toEqual(expected);
      }
    }
  });
  it('coerces signed 32-bit inputs before clamping and exposes the original range percent', () => {
    for (const [input, integer] of [[NaN, 0], [Infinity, 0], [-Infinity, 0], [4.9, 4], [-2.9, -2], [2 ** 32 + 5, 5], [2 ** 31, -(2 ** 31)], ['0x10', 16], ['invalid', 0]] as const) {
      const model = new MiiCharacterData();
      model.setValue(field.name, input);
      expect(model.getValue(field.name)).toBe(Math.max(field.min, Math.min(field.max, integer)));
    }
    const model = new MiiCharacterData();
    const view = model.getMiiValue(field.name) as MiiDataValue;
    expect([view.min, view.max]).toEqual([field.min, field.max]);
    model.setValue(field.name, field.max);
    expect(view.getValuePercent()).toBe(1);
    model.setValue(field.name, field.min);
    expect(view.getValuePercent()).toBe(0);
  });
});

for (const name of Object.keys(MII_PERMUTATIONS) as (keyof typeof MII_PERMUTATIONS)[]) describe(`ordering ${name}`, () => {
  it('matches every source entry and is a full invertible permutation', () => {
    const original = JSON.parse(source.match(new RegExp(`"${name}":(\\[[^\\]]+\\])`))![1]!) as number[];
    expect(MII_PERMUTATIONS[name]).toEqual(original);
    expect([...original].sort((a, b) => a - b)).toEqual(Array.from({ length: original.length }, (_, n) => n));
    for (const [value, zeroBasedFrame] of original.entries()) {
      expect(valueToFrame(name, value)).toBe(zeroBasedFrame + 1);
      expect(frameToValue(name, zeroBasedFrame + 1)).toBe(value);
      const model = new MiiCharacterData(); model.setValue(name, value);
      expect(model.getFrame(name)).toBe(zeroBasedFrame + 1);
      expect(model.frameToValue(name, zeroBasedFrame + 1)).toBe(value);
    }
    expect(frameToValue(name, 0)).toBe(-1);
    expect(frameToValue(name, original.length + 1)).toBe(-1);
    expect(valueToFrame(name, original.length + 4)).toBe(original.length + 5);
    expect(valueToFrame(name, -1)).toBe(0);
  });
});

it('identity frame conversion, unknown fields, and range operations match source semantics', () => {
  expect(valueToFrame('headType', 7)).toBe(8);
  expect(frameToValue('headType', 8)).toBe(7);
  const model = new MiiCharacterData();
  expect(model.getFrame('unknown')).toBe(0);
  expect(model.getValue('unknown')).toBeNull();
  expect(model.getMiiValue('unknown')).toBeNull();
  expect(model.setValue('unknown', 4)).toBe(false);
  const range = new Range(8, 2); range.normalize();
  expect([range.min, range.max, range.span]).toEqual([2, 8, 6]);
  expect(range.percentAt(5)).toBe(0.5);
  expect(range.percentAt(100)).toBe(1);
  expect(range.valueAt(0.5)).toBe(5);
  expect(range.valueAt(0.999999, true)).toBe(8);
  expect(range.valueAt(-1, true)).toBe(2);
  expect(range.valueAt(2, true)).toBe(8);
  expect(range.stepValue(4, 3)).toBe(5);
  expect(range.stepValue(4, 0)).toBe(2);
  expect(range.stepValue(4, 2.9)).toBe(2);
  expect(range.stepValue(10, 3)).toBe(8);
  range.max = 14; expect(range.span).toBe(12);
  expect(new Range(0, 0).percentAt(0)).toBeNaN();
  expect(range.clamp(NaN)).toBeNaN();
  expect(asInt(2 ** 32 + 7)).toBe(7);
  expect(model.toString()).toBe('[object MiiCharacterData]');
});

describe('legacy hexadecimal import versus strict fixture parsing', () => {
  it.each([
    ['a', [10]], ['a-b-c-d', [10, 11, 12, 13]], ['12 34:56-78', [18, 52, 86, 120]],
    ['1g-g1-zz-fF', [1, 0, 0, 255]], ['0x1234', [0, 18, 52]], ['---', []],
    ['f'.repeat(150), new Array<number>(74).fill(255)],
  ])('decodes permissive tokens %j', (text, prefix) => {
    const model = MiiCharacterData.fromHex(DEFAULT_MII_HEX);
    model.setHexData(text);
    const expected = new Uint8Array(74); expected.set(prefix.slice(0, 74));
    expect(model.toBytes()).toEqual(expected);
  });
  it('empty legacy input is a no-op; invalid binary preserves existing state', () => {
    const model = MiiCharacterData.fromHex(DEFAULT_MII_HEX);
    model.setHexData('');
    expect(model.toHex()).toBe(DEFAULT_MII_HEX);
    expect(model.parseByteData(new Uint8Array(73))).toBe(false);
    model.setData(new Uint8Array(75));
    model.setData('not XML or hex');
    expect(model.toHex()).toBe(DEFAULT_MII_HEX);
  });
  it('setData preserves its parseInt dispatch distinction', () => {
    const model = MiiCharacterData.fromHex(DEFAULT_MII_HEX);
    model.setData('---ff'); // not routed to permissive hex by source
    expect(model.toHex()).toBe(DEFAULT_MII_HEX);
    model.setData('ff:01');
    expect(model.toBytes().slice(0, 3)).toEqual(new Uint8Array([255, 1, 0]));
    expect(model.getData()).toEqual(model.toBytes());
    expect(model.getHexData()).toBe(model.toHex());
  });
});

describe('creator and IDs', () => {
  it.each(['', '1234567890extra', '水😀abc', 'a\0b', '123456789😀'])('writes creator %j in bytes 54–73 only', (name) => {
    const original = patterned(); const model = MiiCharacterData.fromBytes(original);
    model.creator = name;
    expect(model.toBytes().slice(0, 54)).toEqual(original.slice(0, 54));
    const expected = new Uint8Array(20);
    for (let n = 0; n < 10; n += 1) { const code = name.charCodeAt(n) || 0; expected[n * 2] = code >>> 8; expected[n * 2 + 1] = code & 255; }
    expect(model.toBytes().slice(54)).toEqual(expected);
    expect(model.creator).toBe(name.slice(0, 10).replaceAll('\0', ''));
  });
  for (const [field, offset] of [['id', 24], ['wii', 28]] as const) it(`${field}: exact byte order, permissive writes, formatting and isolation`, () => {
    const before = patterned(); const model = MiiCharacterData.fromBytes(before);
    expect(model.setHex(field, '00-0a-0f-ff')).toBe(true);
    expect(model.getValue(field)).toEqual([0, 10, 15, 255]);
    expect(model.getHex(field)).toBe('00-a-f-ff');
    expect(model.getHex(field, 'FF')).toBe('FF-FF-FF-FF');
    expect(model.toBytes().slice(0, offset)).toEqual(before.slice(0, offset));
    expect(model.toBytes().slice(offset + 4)).toEqual(before.slice(offset + 4));
    const hex = model.toHex();
    expect(model.setHex(field, 'ff-ff-ff')).toBe(false);
    expect(model.toHex()).toBe(hex);
    expect(model.setHex(field, 'g1-1g-zz-ff-EXTRA')).toBe(true);
    expect(model.getValue(field)).toEqual([0, 1, 0, 255]);
    model.getValue(field).fill(0);
    expect(model.getValue(field)).toEqual([0, 1, 0, 255]);
  });
  it('preserves source string API results for unknown/non-string fields', () => {
    const model = new MiiCharacterData();
    expect(model.getString('height')).toBe('');
    expect(model.setString('height', 'abc')).toBe(false);
    expect(model.getHex('name')).toBe('');
    expect(model.setHex('unknown', '1234')).toBe(false);
    model.setValue('creator', 123); expect(model.creator).toBe('123');
  });
});

describe('randomization', () => {
  it.each([0, 0.5, 1 - Number.EPSILON])('follows all 49 draws at percent %f, preserving Wii ID and unknown bits', (percent) => {
    const original = patterned(); const model = MiiCharacterData.fromBytes(original);
    let draws = 0; legacyRandomize(model,() => { draws += 1; return percent; });
    expect(draws).toBe(49);
    const expected = original.slice();
    for (const field of sourceFields) {
      const value = field.min + Math.floor((field.max - field.min + 1) * percent);
      expect(model.getValue(field.name)).toBe(value);
      const initial = uint(expected, field.word);
      const clear = initial - (Math.floor(initial / 2 ** field.shift) % 2 ** field.width) * 2 ** field.shift;
      const next = clear + value * 2 ** field.shift;
      expected[field.word * 2] = Math.floor(next / 256); expected[field.word * 2 + 1] = next % 256;
    }
    expected.fill(Math.floor(256 * percent), 24, 28);
    for (const [text, offset] of [['Random', 2], ['Mii Editor', 54]] as const) {
      for (let n = 0; n < 10; n += 1) { const code = text.charCodeAt(n) || 0; expected[offset + n * 2] = code >>> 8; expected[offset + n * 2 + 1] = code & 255; }
    }
    expect(model.toBytes()).toEqual(expected);
    expect(model.toBytes().slice(28, 32)).toEqual(original.slice(28, 32));
  });
  it('uses original alphabetical field order then ID high-to-low with a nonconstant RNG', () => {
    const model = new MiiCharacterData(); let draws = 0;
    const rng = () => ((draws++ * 17 + 3) % 101) / 101;
    legacyRandomize(model,rng);
    const names = JSON.parse(source.match(/valueNames:Array = (\[[^;]+\]);/)![1]!) as string[];
    names.forEach((name, index) => {
      const field = sourceFields.find((f) => f.name === name)!;
      expect(model.getValue(name)).toBe(field.min + Math.floor((field.max - field.min + 1) * (((index * 17 + 3) % 101) / 101)));
    });
    expect(model.id).toEqual([45, 46, 47, 48].map((n) => Math.floor(256 * (((n * 17 + 3) % 101) / 101))));
    expect([model.name, model.creator, draws]).toEqual(['Random', 'Mii Editor', 49]);
  });
});

it('XML export emits source order, inverse coordinates, mappings and original header without a DOM dependency', () => {
  const model = MiiCharacterData.fromHex(DEFAULT_MII_HEX);
  model.name = 'A<&"'; model.creator = 'C>&'; model.setValue('eyeY', 2); model.setValue('eyebrowY', 3); model.setValue('mingles', 0); model.setValue('hairType', 0);
  const xml = model.toXMLString();
  expect(xml.startsWith('<?xml version="1.0" ?>\n<?xml-stylesheet type="text/xsl" href="http://www.miieditor.com/xml/mii.xsl" ?>\n<!DOCTYPE mii-collection SYSTEM "http://www.miieditor.com/xml/mii.dtd" >\n')).toBe(true);
  expect(xml).toContain('<name maxChars="10">A&lt;&amp;"</name>');
  expect(xml).toContain('<creator maxChars="10">C&gt;&amp;</creator>');
  expect(xml).toContain('<data name="eyeY" value="16" format="integer" min="0" max="18"/>');
  expect(xml).toContain('<data name="eyebrowY" value="15" format="integer" min="0" max="15"/>');
  expect(xml).toContain('<data name="mingles" value="1"');
  expect(xml).toContain('<data name="hairType" value="59"');
  expect([...xml.matchAll(/<data name="(\w+)"/g)].map((m) => m[1])).toEqual(['id', 'wii', ...MII_VALUE_NAMES]);
  expect(xml).toContain(`<mii value="${model.toHex()}">`);
});
