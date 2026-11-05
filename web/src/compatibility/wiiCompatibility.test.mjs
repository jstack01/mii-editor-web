// Node-only corpus/ActionScript differential tests; production audit remains TypeScript.
import { expect, it } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { MiiCharacterData, MII_FIELDS, MII_VALUE_NAMES } from "../model/MiiCharacterData";
import { DEFAULT_MII_HEX } from "../generated/default-character";
import { importBinary } from "../files/characterFiles";
import { auditWiiRCD, readPacked, wiiExportNotice, WII_RCD_FIELDS } from "./wiiCompatibility";
import original from "../../../EXTRACTED-SWF/classicGUI.swf/scripts/mii/MiiCharacterData.as?raw";
import rangeSource from "../../../EXTRACTED-SWF/classicGUI.swf/scripts/mii/values/Range.as?raw";
import valueSource from "../../../EXTRACTED-SWF/classicGUI.swf/scripts/mii/values/MiiDataValue.as?raw";
import expectedText from "../../../random-mii-testing/expected.json?raw";
import rcdText from "../../../evidence/randomization-compatibility/rcd-fields.json?raw";
const corpus = JSON.parse(expectedText);
function seeded(seed) {
	return () => {
		seed ^= seed << 13;
		seed ^= seed >>> 17;
		seed ^= seed << 5;
		return (seed >>> 0) / 4294967296;
	};
}
// Separate arithmetic oracle reads declarations directly, not generated TS masks.
const constants = new Map(Array.from(original.matchAll(/public static const (\w+):int = (\d+);/g), (m) => [m[1], Number(m[2])]));
const definitions = new Map(Array.from(original.matchAll(/defineValue\("(\w+)",(\w+),(\d+)(?:,(\d+))?(?:,(\d+))?(?:,(\d+))?\);/g), (m) => {
	const width = Number(m[4] ?? 1);
	return [m[1], {
		word: constants.get(m[2]),
		shift: Number(m[3]),
		width,
		min: Number(m[5] ?? 0),
		max: Number(m[6] ?? 0) || 2 ** width - 1
	}];
}));
const order = JSON.parse(original.match(/valueNames:Array = (\[[^;]+\]);/)[1]);
function oracle(before, rng) {
	const words = Array.from({ length: 37 }, (_, i) => before[i * 2] * 256 + before[i * 2 + 1]);
	for (const name of order) {
		const f = definitions.get(name);
		const value = f.min + Math.floor((f.max - f.min + 1) * rng()), power = 2 ** f.shift;
		words[f.word] = words[f.word] - Math.floor(words[f.word] / power) % 2 ** f.width * power + value * power;
	}
	const bytes = Uint8Array.from(words.flatMap((w) => [Math.floor(w / 256), w % 256]));
	for (let i = 24; i < 28; i++) bytes[i] = Math.floor(256 * rng());
	for (const [offset, text] of [[2, "Random"], [54, "Mii Editor"]]) for (let i = 0; i < 10; i++) {
		const u = text.charCodeAt(i) || 0;
		bytes[offset + i * 2] = u >>> 8;
		bytes[offset + i * 2 + 1] = u & 255;
	}
	return bytes;
}
it("keeps the independent RCD profile pinned and distinct from Flash limits", () => {
	expect(WII_RCD_FIELDS).toEqual(JSON.parse(rcdText));
	expect(definitions.size).toBe(45);
	expect(order).toEqual(MII_VALUE_NAMES);
	expect(definitions.get("moleSize").max).toBe(15);
	expect(WII_RCD_FIELDS.find((f) => f.field === "moleSize").max).toBe(8);
	expect(rangeSource).toContain("Math.floor((span + 1) * param1)");
	expect(valueSource).toContain("valueAt(Math.random(),true)");
});
for (const sample of corpus) it(`decodes every field independently and preserves all 74 bytes: ${sample.file}`, () => {
	const bytes = new Uint8Array(readFileSync(new URL("../../../random-mii-testing/" + sample.file, import.meta.url)));
	expect(Buffer.from(bytes).toString("hex")).toBe(sample.hex);
	const model = importBinary(bytes);
	expect(model.toBytes()).toEqual(bytes);
	expect(model.toHex()).toBe(sample.hex);
	expect(sample.sourceRangeViolations).toEqual([]);
	for (const f of WII_RCD_FIELDS) {
		expect(readPacked(bytes, f.offset, f.width)).toBe(sample.values[f.field]);
		if (f.field in MII_FIELDS) expect(model.getValue(f.field)).toBe(sample.values[f.field]);
	}
	const before = model.toHex(), audit = auditWiiRCD(model.toBytes());
	expect(audit.rangeIssues.map((i) => i.field)).toEqual(sample.rcdRangeViolations);
	expect(audit.rangeIssues.length === 0).toBe(sample.rcdAccepted);
	expect(model.toHex()).toBe(before);
	expect(wiiExportNotice(bytes)).toContain("do not certify");
});
it("separates genuine RCD failures from byte-swapped DS fallback diagnostics", () => {
	const fail = corpus.filter((s) => !s.rcdAccepted);
	expect(fail.map((s) => [
		s.values.moleSize,
		s.values.eyebrowSize,
		s.values.eyebrowY,
		s.values.birthMonth
	])).toEqual([
		[
			9,
			5,
			9,
			10
		],
		[
			11,
			0,
			7,
			1
		],
		[
			14,
			2,
			3,
			11
		]
	]);
	const swap = (s, o) => {
		const b = Buffer.from(s.hex, "hex");
		return b[o + 1] * 256 + b[o];
	};
	expect(swap(fail[0], 38) >>> 9 & 15).toBe(10);
	expect(swap(fail[1], 0) >>> 10 & 15).toBe(13);
	expect(swap(fail[2], 38) >>> 4 & 31).toBe(20);
});
it("matches original random arithmetic byte-for-byte over 10,000 draws; only mole size escapes RCD scalar ranges", () => {
	const rng = seeded(23156), ref = seeded(23156), model = MiiCharacterData.fromHex(DEFAULT_MII_HEX);
	const failures = {}, histogram = Array(16).fill(0), hardware = {}, samples = [];
	for (let i = 0; i < 1e4; i++) {
		const wanted = oracle(model.toBytes(), ref);
		model.randomize(rng);
		expect(model.toBytes()).toEqual(wanted);
		for (const f of Object.keys(MII_FIELDS)) {
			const d = definitions.get(f), value = model.getValue(f);
			expect(value >= d.min && value <= d.max).toBe(true);
		}
		const audit = auditWiiRCD(wanted);
		for (const issue of audit.rangeIssues) failures[issue.field] = (failures[issue.field] ?? 0) + 1;
		for (const message of audit.cautions) {
			const key = message.startsWith("Birthday") ? "calendar" : message.startsWith("CreateID has") ? "temporaryId" : message.startsWith("Special") ? "specialMingle" : "other";
			hardware[key] = (hardware[key] ?? 0) + 1;
		}
		histogram[model.getValue("moleSize")]++;
		samples.push(model.toHex());
	}
	expect(Object.keys(failures)).toEqual(["moleSize"]);
	expect(failures.moleSize).toBeGreaterThan(4e3);
	expect(hardware).toEqual({calendar:1196,temporaryId:5014,specialMingle:1222});
	expect(histogram.every((n) => n > 0)).toBe(true);
	if (process.env.MII_COMPAT_REPORT) writeFileSync(process.env.MII_COMPAT_REPORT, JSON.stringify({
		seed: "0x5a74",
		iterations: 1e4,
		failures,
		histogram,
		hardware,
		samples
	}, null, 2));
});
it("preserves reserved bytes during randomization and cannot create the reported Wii month/brow violations", () => {
	const bytes = MiiCharacterData.fromHex(DEFAULT_MII_HEX).toBytes();
	bytes[0] |= 128;
	bytes[34] |= 0;
	bytes[35] |= 31;
	bytes[37] |= 63;
	bytes[53] |= 1;
	const model = MiiCharacterData.fromBytes(bytes), rng = seeded(7);
	for (let i = 0; i < 200; i++) {
		const wanted = oracle(model.toBytes(), seeded(i + 1));
		const next = seeded(i + 1);
		model.randomize(next);
		expect(model.toBytes()).toEqual(wanted);
		expect(model.getValue("eyebrowSize")).toBeLessThanOrEqual(8);
		expect(model.getValue("eyebrowY")).toBeLessThanOrEqual(18);
		expect(model.getValue("birthMonth")).toBeLessThanOrEqual(12);
	}
	model.randomize(rng);
	expect(model.toBytes()[0] & 128).toBe(128);
	expect(auditWiiRCD(model.toBytes()).cautions.some((c) => c.includes("padding"))).toBe(true);
});
it("changes only explicitly edited mole bits when making a controlled decoder-compatible copy", () => {
	for (const s of corpus.filter((x) => !x.rcdAccepted)) {
		const model = MiiCharacterData.fromHex(s.hex);
		model.setValue("moleSize", 8);
		expect(auditWiiRCD(model.toBytes()).rangeIssues).toEqual([]);
		const a = Buffer.from(s.hex, "hex"), b = Buffer.from(model.toBytes());
		for (let i = 0; i < 74; i++) expect(a[i] ^ b[i]).toBe(i === 52 ? (s.values.moleSize ^ 8) << 3 : 0);
		expect(MiiCharacterData.fromHex(s.hex).getValue("moleSize")).toBe(s.values.moleSize);
	}
});
it("checks ID validity, temporary/special flags, calendar, wider RFL fields and padding without normalizing", () => {
	const model = MiiCharacterData.fromHex(DEFAULT_MII_HEX), bytes = model.toBytes();
	bytes.fill(0, 24, 32);
	expect(auditWiiRCD(bytes).cautions).toContain("The eight-byte CreateID is zero.");
	bytes[24] = 32;
	expect(auditWiiRCD(bytes).cautions.some((x) => x.includes("temporary"))).toBe(true);
	bytes[24] = 64;
	bytes[33] &= 251;
	expect(auditWiiRCD(bytes).cautions.some((x) => x.includes("Special"))).toBe(true);
	bytes[33] |= 4;
	expect(auditWiiRCD(bytes).cautions.some((x) => x.includes("Special"))).toBe(false);
	bytes[42] |= 16;
	expect(auditWiiRCD(bytes).cautions.some((x) => x.includes("eye scale"))).toBe(true);
	expect(() => auditWiiRCD(new Uint8Array(76))).toThrow(/74/);
	expect(auditWiiRCD(Buffer.from(corpus[2].hex, "hex")).cautions.some((x) => x.startsWith("Birthday 11/31"))).toBe(true);
});

it('keeps exact source randomization endpoints rather than imposing Wii limits',()=>{for(const [rng,max]of [[()=>0,false],[()=>1-Number.EPSILON,true]]){const m=MiiCharacterData.fromHex(DEFAULT_MII_HEX);m.randomize(rng);for(const [name,f]of definitions)expect(m.getValue(name)).toBe(max?f.max:f.min);expect(m.getValue('moleSize')).toBe(max?15:0);}});
