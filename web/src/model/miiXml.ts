/** Explicit E4X adapter around the browser XML parser. No network or DOM insertion. */
import type { MiiCharacterData } from './MiiCharacterData';
import { MII_FIELDS, MII_VALUE_NAMES } from '../generated/mii-schema';
import { permutation } from './featureOrder';
import { asInt } from './MiiDataValue';

const REVERSE_Y = new Set(['eyeY', 'glassesY', 'moleY', 'mouthY', 'mustacheY', 'noseY']);
export const LEGACY_XML_HEADER = '<?xml version="1.0" ?>\n<?xml-stylesheet type="text/xsl" href="http://www.miieditor.com/xml/mii.xsl" ?>\n<!DOCTYPE mii-collection SYSTEM "http://www.miieditor.com/xml/mii.dtd" >\n';
function escape(text: string, attribute = false): string {
  let result = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#xD;');
  if (attribute) result = result.replace(/"/g, '&quot;').replace(/\n/g, '&#xA;').replace(/\t/g, '&#x9;');
  return result;
}
function data(name: string, value: string | number, format: string, min: string | number, max: string | number): string {
  return `    <data name="${name}" value="${escape(String(value), true)}" format="${format}" min="${min}" max="${max}"/>`;
}
export function serializeMiiXML(model: MiiCharacterData, header: boolean): string {
  const lines = [`<mii-collection>`, `  <mii value="${model.toHex()}">`,
    `    <name maxChars="10">${escape(model.name)}</name>`, `    <creator maxChars="10">${escape(model.creator)}</creator>`,
    data('id', model.getHex('id'), 'hexadecimal', model.getHex('id', '00'), model.getHex('id', 'FF')),
    data('wii', model.getHex('wii'), 'hexadecimal', model.getHex('wii', '00'), model.getHex('wii', 'FF'))];
  for (const name of MII_VALUE_NAMES) {
    const field = MII_FIELDS[name];
    let value: number = model.getValue(name);
    let min: number = field.min;
    let max: number = field.max;
    if (REVERSE_Y.has(name)) value = max - value;
    else if (name === 'eyebrowY') { value -= 3; min -= 3; max -= 3; value = max - value; }
    else if (name === 'mingles') value = value === 0 ? 1 : 0;
    const map = permutation(name);
    if (map && value < map.length) value = asInt(map[value]);
    lines.push(data(name, value, 'integer', min, max));
  }
  lines.push('  </mii>', '</mii-collection>');
  return (header ? LEGACY_XML_HEADER : '') + lines.join('\n');
}
export function parseXMLDocument(input: string): Element {
  if (typeof DOMParser === 'undefined') throw new Error('XML import requires a browser DOMParser; no server-side XML dependency is installed.');
  // Original-produced documents have only an external DTD reference; no entities.
  // Internal DTD subsets are deliberately unsupported rather than expanded.
  if (/<!DOCTYPE[^>]*\[/i.test(input)) throw new SyntaxError('Internal DTD subsets are outside the verified Mii XML format.');
  const document = new DOMParser().parseFromString(input, 'application/xml');
  const parserErrors = ['http://www.mozilla.org/newlayout/xml/parsererror.xml', 'http://www.w3.org/1999/xhtml']
    .some((namespace) => document.getElementsByTagNameNS(namespace, 'parsererror').length > 0);
  if (parserErrors || document.documentElement.localName === 'parsererror') throw new SyntaxError('Malformed XML.');
  return document.documentElement;
}
function children(element: Element | undefined, name: string): Element[] {
  return element ? Array.from(element.children).filter((child) => child.localName === name && !child.namespaceURI) : [];
}
function e4xText(element: Element | undefined): string {
  if (!element) throw new TypeError('Missing legacy XML name/creator element.');
  if (element.children.length) throw new TypeError('Complex name/creator XML content requires separate E4X verification.');
  // E4X defaults ignore comments/PIs and trims XML whitespace on parsed text nodes.
  return Array.from(element.childNodes).filter((n) => n.nodeType === 3 || n.nodeType === 4)
    .map((n) => (n.nodeValue ?? '').replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, '')).join('');
}
export function applyMiiXML(model: MiiCharacterData, input: string | Element | Document): boolean {
  const root = typeof input === 'string' ? parseXMLDocument(input) : input.nodeType === 9 ? (input as Document).documentElement : input as Element;
  const mii = root.localName === 'mii' ? root : children(root, 'mii')[0];
  model.defaultBlocks();
  model.name = e4xText(children(mii, 'name')[0]);
  model.creator = e4xText(children(mii, 'creator')[0]);
  for (const node of children(mii, 'data')) {
    const name = node.getAttribute('name') ?? '';
    const field = model.getMiiValue(name);
    if (!field) continue;
    let value: string | number = node.getAttribute('value') ?? '';
    const schema = Object.hasOwn(MII_FIELDS, name) ? MII_FIELDS[name as keyof typeof MII_FIELDS] : undefined;
    if (schema && REVERSE_Y.has(name)) value = schema.max - asInt(value);
    else if (name === 'eyebrowY') value = MII_FIELDS.eyebrowY.max - 3 - asInt(value) + 3;
    else if (name === 'mingles') value = asInt(value) === 0 ? 1 : 0;
    const map = permutation(name);
    if (map) {
      const index = map.indexOf(asInt(value));
      if (index !== -1) value = index;
    }
    model.setValue(name, value);
  }
  return true;
}
