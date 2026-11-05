# Independent sample field comparison

Wii values are read MSB-first directly from the 74 input bytes, independently of the application model. No format conversion, range repair or byte swapping is applied. RCD bounds come from the pinned MiiJS layout, corroborated for facial fields by RFLi_Config.h. This is a decoder profile, not hardware certification.

| Field | Flash word:shift/width | Flash range | Wii RCD range | Fail/FAIL-1.mii | Fail/FAIL-2.mii | Fail/FAIL-3.mii | Success/Random (2).mii | Success/Random (4).mii | Success/Random (5).mii | Success/Random.mii |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gender | 0:14/1 | 0–1 | 0–1 | 1 | 0 | 1 | 0 | 1 | 1 | 1 |
| favoriteColor | 0:1/4 | 0–11 | 0–11 | 5 | 11 | 6 | 6 | 9 | 3 | 2 |
| birthDate | 0:5/5 | 0–31 | 0–31 | 24 | 27 | 31 | 25 | 23 | 12 | 13 |
| birthMonth | 0:10/4 | 0–12 | 0–12 | 10 | 1 | 11 | 4 | 4 | 5 | 1 |
| height | 11:8/7 | 0–127 | 0–127 | 87 | 107 | 106 | 43 | 35 | 116 | 64 |
| weight | 11:0/7 | 0–127 | 0–127 | 78 | 126 | 48 | 58 | 102 | 58 | 65 |
| headType | 16:13/3 | 0–7 | 0–7 | 4 | 5 | 7 | 3 | 6 | 1 | 4 |
| skinColor | 16:10/3 | 0–5 | 0–5 | 3 | 4 | 2 | 3 | 5 | 2 | 1 |
| facialFeaturesType | 16:6/4 | 0–11 | 0–11 | 3 | 2 | 4 | 2 | 10 | 11 | 9 |
| mingles | 16:2/1 | 0–1 | 0–1 | 1 | 0 | 0 | 0 | 1 | 1 | 1 |
| hairType | 17:9/7 | 0–71 | 0–71 | 16 | 43 | 47 | 45 | 19 | 15 | 21 |
| hairColor | 17:6/3 | 0–7 | 0–7 | 4 | 3 | 4 | 6 | 5 | 0 | 7 |
| hairPart | 17:5/1 | 0–1 | 0–1 | 1 | 0 | 0 | 1 | 0 | 0 | 0 |
| eyebrowType | 18:11/5 | 0–23 | 0–23 | 10 | 10 | 10 | 13 | 14 | 17 | 3 |
| eyebrowRotation | 18:6/4 | 0–11 | 0–11 | 4 | 7 | 10 | 7 | 0 | 2 | 5 |
| eyebrowColor | 19:13/3 | 0–7 | 0–7 | 2 | 6 | 2 | 7 | 2 | 1 | 7 |
| eyebrowSize | 19:9/4 | 0–8 | 0–8 | 5 | 0 | 2 | 3 | 3 | 5 | 5 |
| eyebrowY | 19:4/5 | 3–18 | 3–18 | 9 | 7 | 3 | 12 | 14 | 12 | 9 |
| eyebrowX | 19:0/4 | 0–12 | 0–12 | 4 | 9 | 5 | 9 | 9 | 5 | 3 |
| eyeType | 20:10/6 | 0–47 | 0–47 | 45 | 46 | 46 | 17 | 23 | 28 | 35 |
| eyeRotation | 20:5/3 | 0–7 | 0–7 | 0 | 3 | 4 | 2 | 4 | 5 | 6 |
| eyeY | 20:0/5 | 0–18 | 0–18 | 0 | 17 | 0 | 0 | 3 | 11 | 0 |
| eyeColor | 21:13/3 | 0–5 | 0–5 | 0 | 3 | 5 | 4 | 5 | 2 | 2 |
| eyeSize | 21:9/3 | 0–7 | 0–7 | 7 | 0 | 0 | 6 | 4 | 7 | 2 |
| eyeX | 21:5/4 | 0–12 | 0–12 | 4 | 8 | 7 | 4 | 7 | 2 | 1 |
| noseType | 22:12/4 | 0–11 | 0–11 | 5 | 0 | 4 | 9 | 8 | 8 | 8 |
| noseSize | 22:8/4 | 0–8 | 0–8 | 5 | 1 | 5 | 5 | 2 | 4 | 1 |
| noseY | 22:3/5 | 0–18 | 0–18 | 10 | 17 | 12 | 16 | 2 | 4 | 11 |
| mouthType | 23:11/5 | 0–23 | 0–23 | 4 | 14 | 4 | 3 | 22 | 12 | 10 |
| mouthColor | 23:9/2 | 0–2 | 0–2 | 0 | 2 | 2 | 0 | 2 | 2 | 0 |
| mouthSize | 23:5/4 | 0–8 | 0–8 | 0 | 2 | 7 | 2 | 6 | 1 | 3 |
| mouthY | 23:0/5 | 0–18 | 0–18 | 16 | 8 | 15 | 14 | 18 | 15 | 18 |
| glassesType | 24:12/4 | 0–8 | 0–8 | 5 | 2 | 1 | 1 | 4 | 8 | 5 |
| glassesColor | 24:9/3 | 0–5 | 0–5 | 1 | 0 | 2 | 0 | 4 | 4 | 3 |
| glassesSize | 24:5/3 | 0–7 | 0–7 | 0 | 2 | 0 | 0 | 6 | 4 | 6 |
| glassesY | 24:0/5 | 0–20 | 0–20 | 10 | 1 | 9 | 8 | 4 | 15 | 2 |
| mustacheType | 25:14/2 | 0–3 | 0–3 | 0 | 1 | 3 | 2 | 3 | 3 | 0 |
| beardType | 25:12/2 | 0–3 | 0–3 | 1 | 1 | 0 | 1 | 1 | 2 | 1 |
| facialHairColor | 25:9/3 | 0–7 | 0–7 | 2 | 1 | 5 | 0 | 2 | 0 | 3 |
| mustacheSize | 25:5/4 | 0–8 | 0–8 | 2 | 6 | 2 | 4 | 3 | 1 | 6 |
| mustacheY | 25:0/5 | 0–16 | 0–16 | 6 | 11 | 0 | 5 | 1 | 3 | 9 |
| moleType | 26:15/1 | 0–1 | 0–1 | 1 | 1 | 1 | 1 | 1 | 0 | 0 |
| moleSize | 26:11/4 | 0–15 | 0–8 | 9 | 11 | 14 | 8 | 0 | 7 | 2 |
| moleY | 26:6/5 | 0–30 | 0–30 | 17 | 23 | 0 | 27 | 17 | 2 | 10 |
| moleX | 26:1/5 | 0–16 | 0–16 | 6 | 10 | 10 | 6 | 13 | 3 | 1 |

MiiJS reads full 8-bit height/weight; Flash exposes only 7 bits. RFL exposes 5-bit eye/eyebrow rotation and 4-bit eye/glasses scale; Flash/MiiJS subdivide some upper bits as unknown/disabled. Nonzero upper bits therefore need additional RFL checks. RFLi_Config.h in the inspected revision allows body values up to 128, whereas the normal editor/MiiJS profile is 0–127; this is not a reason to generate 128.

## Complex fields and every additional packed segment

| Segment (MSB bit offset/width) | Fail/FAIL-1.mii | Fail/FAIL-2.mii | Fail/FAIL-3.mii | Success/Random (2).mii | Success/Random (4).mii | Success/Random (5).mii | Success/Random.mii |
| --- | --- | --- | --- | --- | --- | --- | --- |
| unknown (0/1) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| favorited (15/1) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| name (16/160) | Random | Random | Random | Random | Random | Random | Random |
| miiId (192/32) | 0x1688e4f4 | 0x26bc6d23 | 0x5cfc80cc | 0xa8f2c885 | 0xcde754e3 | 0x6ecea704 | 0x5b47cd1c |
| systemId (224/32) | 0xc2428998 | 0xc2428998 | 0xc2428998 | 0xc2428998 | 0xc2428998 | 0xc2428998 | 0xc2428998 |
| unknown (266/3) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| unknown (270/1) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| fromCheckMiiOut (271/1) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| unknown (283/5) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| unknown (293/1) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| unknown (298/6) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| unknown (326/2) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| unknown (339/1) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| unknown (347/5) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| unknown (365/3) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| disablesMii (391/1) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| unknown (431/1) | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 | 0x0 |
| creatorName (432/160) | Mii Editor | Mii Editor | Mii Editor | Mii Editor | Mii Editor | Mii Editor | Mii Editor |
