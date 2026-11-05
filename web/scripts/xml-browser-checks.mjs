/** Runs in a real browser via page.evaluate; not part of the application bundle. */
export async function xmlCompatibilityChecks() {
  const { MiiCharacterData, MII_FIELDS, MII_VALUE_NAMES, MII_PERMUTATIONS } = await import('/src/model/MiiCharacterData.ts');
  const original = '000000640065006600610075006c00740042006f0079404080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000';
  const tests = [];
  const equal = (actual, expected, message) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${message}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
  };
  const check = (name, fn) => { fn(); tests.push(name); };
  const xml = (data = '', name = 'Name', creator = 'Creator') => `<mii><name>${name}</name><creator>${creator}</creator>${data}</mii>`;
  const fieldXML = (name, value) => `<data name="${name}" value="${value}"/>`;
  const inverse = new Set(['eyeY', 'glassesY', 'moleY', 'mouthY', 'mustacheY', 'noseY']);

  check('original default exports/imports every numeric field and both strings/IDs', () => {
    const model = MiiCharacterData.fromHex(original);
    const imported = MiiCharacterData.fromXML(model.toXMLString());
    for (const name of [...MII_VALUE_NAMES, 'name', 'creator', 'id', 'wii']) equal(imported.getValue(name), model.getValue(name), name);
    equal(imported.toHex(), original, 'valid default binary round trip');
    equal(model.getXMLData().localName, 'mii-collection', 'DOM export root');
  });
  for (const name of MII_VALUE_NAMES) check(`XML ${name}: min/max, reversal, order and clamp`, () => {
    const spec = MII_FIELDS[name];
    for (const value of [spec.min, spec.max]) {
      const model = MiiCharacterData.fromHex(original); model.setValue(name, value);
      const document = new DOMParser().parseFromString(model.toXMLString(), 'application/xml');
      const data = Array.from(document.getElementsByTagName('data')).find((node) => node.getAttribute('name') === name);
      let expected = value;
      if (inverse.has(name)) expected = spec.max - value;
      else if (name === 'eyebrowY') expected = 18 - value;
      else if (name === 'mingles') expected = value === 0 ? 1 : 0;
      if (MII_PERMUTATIONS[name]) expected = MII_PERMUTATIONS[name][expected];
      equal(data.getAttribute('value'), String(expected), `${name} exported XML value`);
      equal(data.getAttribute('min'), String(name === 'eyebrowY' ? 0 : spec.min), `${name} XML min`);
      equal(data.getAttribute('max'), String(name === 'eyebrowY' ? 15 : spec.max), `${name} XML max`);
      equal(MiiCharacterData.fromXML(model.toXMLString()).getValue(name), value, `${name} reimport`);
    }
    for (const text of ['-1000', '1000', 'NaN', '4.9', '0x10', '4294967301']) {
      const converted = Number(text) | 0;
      let expected = converted;
      if (inverse.has(name) || name === 'eyebrowY') expected = spec.max - converted;
      else if (name === 'mingles') expected = converted === 0 ? 1 : 0;
      if (MII_PERMUTATIONS[name]) {
        const found = MII_PERMUTATIONS[name].indexOf(converted);
        if (found !== -1) expected = found;
      }
      expected = Math.max(spec.min, Math.min(spec.max, expected | 0));
      equal(MiiCharacterData.fromXML(xml(fieldXML(name, text))).getValue(name), expected, `${name} XML coercion ${text}`);
    }
  });
  for (const [name, table] of Object.entries(MII_PERMUTATIONS)) check(`XML ${name}: every permutation slot`, () => {
    table.forEach((frame, value) => equal(MiiCharacterData.fromXML(xml(fieldXML(name, frame))).getValue(name), value, `${name}[${value}]`));
  });
  check('binary unknown bits survive individual edits but XML import deliberately clears them', () => {
    const raw = new Uint8Array(74).fill(255);
    const model = MiiCharacterData.fromBytes(raw);
    // Valid known values, while retaining all unused bits from 0xff storage.
    MII_VALUE_NAMES.forEach((name) => model.setValue(name, MII_FIELDS[name].min));
    model.name = 'Name'; model.creator = 'Creator';
    const imported = MiiCharacterData.fromXML(model.toXMLString());
    for (const name of MII_VALUE_NAMES) equal(imported.getValue(name), model.getValue(name), name);
    if (imported.toHex() === model.toHex()) throw new Error('XML unexpectedly preserved unknown bits');
    equal(imported.toWords()[0] & 0x8001, 0, 'basic reserved bits cleared');
  });
  check('XML declared hex is ignored, absent fields are zero even below declared min', () => {
    const model = MiiCharacterData.fromHex(original);
    model.parseXMLData(`<mii value="${'ff'.repeat(74)}"><name>A</name><creator>B</creator></mii>`);
    equal(model.name, 'A', 'name'); equal(model.creator, 'B', 'creator');
    equal(model.getValue('height'), 0, 'no height restored from hex');
    equal(model.getValue('eyebrowY'), 0, 'missing eyebrowY is not normalized');
  });
  check('root mii or first direct mii in arbitrary collection; duplicate fields last wins', () => {
    const model = MiiCharacterData.fromXML(`<collection>${xml(fieldXML('height', 5) + fieldXML('height', 6))}${xml(fieldXML('height', 70))}</collection>`);
    equal(model.getValue('height'), 6, 'first direct mii with ordered duplicates');
    equal(MiiCharacterData.fromXML(xml(fieldXML('unknown', '9'))).getValue('unknown'), null, 'unknown ignored');
    equal(MiiCharacterData.fromXML(xml('<parsererror>ignored unqualified child</parsererror>')).name, 'Name', 'ordinary parsererror named child is ignored');
    equal(MiiCharacterData.fromXML(xml('<data name="height" value="0x10" format="hexadecimal"/>')).getValue('height'), 16, 'format attribute ignored');
  });
  check('XML names/creator entity decoding, escapes, CDATA and default whitespace trimming', () => {
    const model = MiiCharacterData.fromHex(original); model.name = '水😀<&"'; model.creator = 'A>&';
    const imported = MiiCharacterData.fromXML(model.toXMLString());
    equal(imported.name, model.name, 'name escaped round trip'); equal(imported.creator, model.creator, 'creator escaped round trip');
    equal(MiiCharacterData.fromXML(xml('', '  A  ', ' B ')).name, 'A', 'E4X leading/trailing trim');
    equal(MiiCharacterData.fromXML(xml('', '<![CDATA[<b>x</b>]]>', '')).name, '<b>x</b>', 'CDATA is text, not HTML');
    equal(MiiCharacterData.fromXML(xml('', '123456789012', '')).name, '1234567890', 'name truncation');
    equal(MiiCharacterData.fromXML(xml('', '', '123456789😀')).creator, '123456789\ud83d', 'creator code-unit truncation');
    equal(MiiCharacterData.fromXML('<mii><name>A</name><name>B</name><creator>C</creator></mii>').name, 'A', 'first name only');
  });
  check('IDs preserve source decimal-ten padding quirk while remaining re-importable', () => {
    const model = new MiiCharacterData(); model.name = 'A'; model.creator = 'B';
    model.setHex('id', '00-0a-0f-ff'); model.setHex('wii', '0b-0c-0d-0e');
    const imported = MiiCharacterData.fromXML(model.toXMLString());
    equal(imported.id, [0, 10, 15, 255], 'id'); equal(imported.wii, [11, 12, 13, 14], 'wii');
    equal(MiiCharacterData.fromXML(xml(fieldXML('id', '01-02-03'))).id, [0, 0, 0, 0], 'short ID ignored after XML reset');
    equal(MiiCharacterData.fromXML(xml(fieldXML('id', '1g-g1-zz-ff'))).id, [1, 0, 0, 255], 'permissive ID');
  });
  check('XML data entries may override name and creator text fields', () => {
    const model = MiiCharacterData.fromXML(xml(fieldXML('name', 'Override') + fieldXML('creator', 'Second')));
    equal(model.name, 'Override', 'name override'); equal(model.creator, 'Second', 'creator override');
  });
  check('malformed XML fails before reset; missing children fail after reset/partial writes', () => {
    const model = MiiCharacterData.fromHex(original);
    model.setXMLData('<mii>'); equal(model.toHex(), original, 'syntax failure retains data');
    model.setXMLData('<mii><creator>C</creator></mii>'); equal(model.toHex(), '00'.repeat(74), 'missing name resets before failing');
    model.setXMLData('<mii><name>Partial</name></mii>'); equal(model.name, 'Partial', 'missing creator retains partial name');
    equal(model.creator, '', 'creator zero'); equal(model.getValue('height'), 0, 'height zero after partial failure');
    model.setXMLData('<collection/>'); equal(model.toHex(), '00'.repeat(74), 'missing direct mii resets');
    model.setXMLData(xml()); equal(model.name, 'Name', 'still usable after failure');
  });
  check('object parse errors propagate; string and generic wrappers swallow source errors', () => {
    const malformed = new DOMParser().parseFromString('<mii><name>X</name></mii>', 'application/xml');
    let threw = false; const model = new MiiCharacterData();
    try { model.setXMLData(malformed); } catch { threw = true; }
    equal(threw, true, 'XML-object overload throws'); equal(model.name, 'X', 'partial object mutation');
    model.setData('<mii><name>Y</name></mii>'); equal(model.name, 'Y', 'generic wrapper swallows');
    model.setData(xml(fieldXML('height', 44))); equal(model.getValue('height'), 44, 'generic XML route');
  });
  check('document/element import does not mutate caller DOM; namespaced children are not unqualified E4X children', () => {
    const doc = new DOMParser().parseFromString(xml(), 'application/xml');
    const before = new XMLSerializer().serializeToString(doc);
    equal(MiiCharacterData.fromXML(doc).name, 'Name', 'document import');
    equal(MiiCharacterData.fromXML(doc.documentElement).creator, 'Creator', 'element import');
    equal(new XMLSerializer().serializeToString(doc), before, 'caller document unchanged');
    const model = new MiiCharacterData(); model.setXMLData('<mii xmlns="urn:other"><name>A</name><creator>B</creator></mii>');
    equal(model.name, '', 'unqualified name absent in namespaced document');
  });
  check('unsupported internal DTDs fail without expanding entities or changing existing data', () => {
    const model = MiiCharacterData.fromHex(original);
    model.setXMLData('<!DOCTYPE mii [<!ENTITY x "X">]><mii><name>&x;</name><creator>B</creator></mii>');
    equal(model.toHex(), original, 'unsupported DTD rejected before reset');
  });
  check('all original field values from deterministic randomization survive XML interchange', () => {
    const model = new MiiCharacterData(); let n = 0;
    model.randomize(() => ((n++ * 17 + 3) % 101) / 101);
    const imported = MiiCharacterData.fromXML(model.toXMLString());
    equal(imported.toHex(), model.toHex(), 'fully defined random character interchange');
  });
  return { count: tests.length, tests };
}
