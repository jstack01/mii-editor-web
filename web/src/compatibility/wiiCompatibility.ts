/** Read-only Wii RCD decoder profile, independent of Flash editing ranges.
 * Source positions/bounds: pinned MiiJS RCD layout and ogws RFL references;
 * see evidence/randomization-compatibility/references.json. Never repairs data. */
export const WII_RCD_FIELDS = [
  {
    "field": "gender",
    "offset": 1,
    "width": 1,
    "min": 0,
    "max": 1
  },
  {
    "field": "birthMonth",
    "offset": 2,
    "width": 4,
    "min": 0,
    "max": 12
  },
  {
    "field": "birthDate",
    "offset": 6,
    "width": 5,
    "min": 0,
    "max": 31
  },
  {
    "field": "favoriteColor",
    "offset": 11,
    "width": 4,
    "min": 0,
    "max": 11
  },
  {
    "field": "height",
    "offset": 176,
    "width": 8,
    "min": 0,
    "max": 127
  },
  {
    "field": "weight",
    "offset": 184,
    "width": 8,
    "min": 0,
    "max": 127
  },
  {
    "field": "headType",
    "offset": 256,
    "width": 3,
    "min": 0,
    "max": 7
  },
  {
    "field": "skinColor",
    "offset": 259,
    "width": 3,
    "min": 0,
    "max": 5
  },
  {
    "field": "facialFeaturesType",
    "offset": 262,
    "width": 4,
    "min": 0,
    "max": 11
  },
  {
    "field": "mingles",
    "offset": 269,
    "width": 1,
    "min": 0,
    "max": 1
  },
  {
    "field": "hairType",
    "offset": 272,
    "width": 7,
    "min": 0,
    "max": 71
  },
  {
    "field": "hairColor",
    "offset": 279,
    "width": 3,
    "min": 0,
    "max": 7
  },
  {
    "field": "hairPart",
    "offset": 282,
    "width": 1,
    "min": 0,
    "max": 1
  },
  {
    "field": "eyebrowType",
    "offset": 288,
    "width": 5,
    "min": 0,
    "max": 23
  },
  {
    "field": "eyebrowRotation",
    "offset": 294,
    "width": 4,
    "min": 0,
    "max": 11
  },
  {
    "field": "eyebrowColor",
    "offset": 304,
    "width": 3,
    "min": 0,
    "max": 7
  },
  {
    "field": "eyebrowSize",
    "offset": 307,
    "width": 4,
    "min": 0,
    "max": 8
  },
  {
    "field": "eyebrowY",
    "offset": 311,
    "width": 5,
    "min": 3,
    "max": 18
  },
  {
    "field": "eyebrowX",
    "offset": 316,
    "width": 4,
    "min": 0,
    "max": 12
  },
  {
    "field": "eyeType",
    "offset": 320,
    "width": 6,
    "min": 0,
    "max": 47
  },
  {
    "field": "eyeRotation",
    "offset": 328,
    "width": 3,
    "min": 0,
    "max": 7
  },
  {
    "field": "eyeY",
    "offset": 331,
    "width": 5,
    "min": 0,
    "max": 18
  },
  {
    "field": "eyeColor",
    "offset": 336,
    "width": 3,
    "min": 0,
    "max": 5
  },
  {
    "field": "eyeSize",
    "offset": 340,
    "width": 3,
    "min": 0,
    "max": 7
  },
  {
    "field": "eyeX",
    "offset": 343,
    "width": 4,
    "min": 0,
    "max": 12
  },
  {
    "field": "noseType",
    "offset": 352,
    "width": 4,
    "min": 0,
    "max": 11
  },
  {
    "field": "noseSize",
    "offset": 356,
    "width": 4,
    "min": 0,
    "max": 8
  },
  {
    "field": "noseY",
    "offset": 360,
    "width": 5,
    "min": 0,
    "max": 18
  },
  {
    "field": "mouthType",
    "offset": 368,
    "width": 5,
    "min": 0,
    "max": 23
  },
  {
    "field": "mouthColor",
    "offset": 373,
    "width": 2,
    "min": 0,
    "max": 2
  },
  {
    "field": "mouthSize",
    "offset": 375,
    "width": 4,
    "min": 0,
    "max": 8
  },
  {
    "field": "mouthY",
    "offset": 379,
    "width": 5,
    "min": 0,
    "max": 18
  },
  {
    "field": "glassesType",
    "offset": 384,
    "width": 4,
    "min": 0,
    "max": 8
  },
  {
    "field": "glassesColor",
    "offset": 388,
    "width": 3,
    "min": 0,
    "max": 5
  },
  {
    "field": "disablesMii",
    "offset": 391,
    "width": 1,
    "min": 0,
    "max": 0
  },
  {
    "field": "glassesSize",
    "offset": 392,
    "width": 3,
    "min": 0,
    "max": 7
  },
  {
    "field": "glassesY",
    "offset": 395,
    "width": 5,
    "min": 0,
    "max": 20
  },
  {
    "field": "mustacheType",
    "offset": 400,
    "width": 2,
    "min": 0,
    "max": 3
  },
  {
    "field": "beardType",
    "offset": 402,
    "width": 2,
    "min": 0,
    "max": 3
  },
  {
    "field": "facialHairColor",
    "offset": 404,
    "width": 3,
    "min": 0,
    "max": 7
  },
  {
    "field": "mustacheSize",
    "offset": 407,
    "width": 4,
    "min": 0,
    "max": 8
  },
  {
    "field": "mustacheY",
    "offset": 411,
    "width": 5,
    "min": 0,
    "max": 16
  },
  {
    "field": "moleType",
    "offset": 416,
    "width": 1,
    "min": 0,
    "max": 1
  },
  {
    "field": "moleSize",
    "offset": 417,
    "width": 4,
    "min": 0,
    "max": 8
  },
  {
    "field": "moleY",
    "offset": 421,
    "width": 5,
    "min": 0,
    "max": 30
  },
  {
    "field": "moleX",
    "offset": 426,
    "width": 5,
    "min": 0,
    "max": 16
  }
] as const;
export interface WiiRangeIssue {field:string;value:number;min:number;max:number}
export function readPacked(bytes:Uint8Array,offset:number,width:number):number {
 let value=0;for(let bit=offset;bit<offset+width;bit++)value=value*2+((bytes[bit>>>3]!>>>(7-(bit&7)))&1);return value;
}
export function auditWiiRCD(bytes:Uint8Array):{rangeIssues:WiiRangeIssue[];cautions:string[]} {
 if(bytes.byteLength!==74)throw new RangeError('Wii RCD auditing requires exactly 74 bytes.');
 const rangeIssues:WiiRangeIssue[]=[];for(const f of WII_RCD_FIELDS){const value=readPacked(bytes,f.offset,f.width);if(value<f.min||value>f.max)rangeIssues.push({field:f.field,value,min:f.min,max:f.max});}
 const cautions:string[]=[],idValid=bytes.slice(24,32).some(b=>b!==0),id=readPacked(bytes,192,32),temporary=(id&0x20000000)!==0;
 if(!idValid)cautions.push('The eight-byte CreateID is zero.');
 if(temporary)cautions.push('CreateID has the temporary flag (not valid for NAND storage in the inspected RFL revision).');
 if(idValid&&!temporary&&(id&0x80000000)===0&&readPacked(bytes,269,1)===0)cautions.push('Special CreateID permits mingling; inspected RFL requires local-only.');
 const month=readPacked(bytes,2,4),day=readPacked(bytes,6,5),days=[0,31,29,31,30,31,30,31,31,30,31,30,31];
 if(month>12||day>(days[month]??0)||(month!==0&&day===0))cautions.push(`Birthday ${month}/${day} fails the inspected RFL calendar rule.`);
 for(const [label,offset,width,max]of [['eyebrow rotation',293,5,11],['eye rotation',326,5,7],['eye scale',339,4,7],['glasses scale',391,4,7]] as const){if(readPacked(bytes,offset,width)>max)cautions.push(`The full RFL ${label} field exceeds ${max}; upper bits are not normalized.`);}
 const padding=[[0,1],[266,3],[283,5],[298,6],[347,5],[365,3],[431,1]] as const;
 if(padding.some(([o,w])=>readPacked(bytes,o,w)!==0))cautions.push('Nonzero RFL padding bits are preserved; hardware acceptance is not certified.');
 return {rangeIssues,cautions};
}
/** Nonblocking download feedback. Even a clean range profile is not a console certificate. */
export function wiiExportNotice(bytes:Uint8Array):string {
 const audit=auditWiiRCD(bytes),parts:string[]=[];
 if(audit.rangeIssues.length)parts.push('Wii RCD range warning: '+audit.rangeIssues.map(i=>`${i.field} = ${i.value} (expected ${i.min}–${i.max})`).join('; ')+'.');
 if(audit.cautions.length)parts.push('Wii hardware cautions: '+audit.cautions.join(' '));
 if(parts.length)parts.push('Downloaded bytes are unchanged.');
 parts.push('RCD range checks do not certify Wii hardware compatibility.');return parts.join(' ');
}
