# Permanent randomized compatibility corpus

The seven supplied 74-byte files remain byte-for-byte unchanged. Fail/Success names record the user's InfiniMii results, independently reproduced with pinned MiiJS 3.1.1. expected.json stores hashes, exact hex, every numeric field and both range profiles. Node corpus tests read the actual files, not just the expectations. Working samples must stay accepted; failing samples remain intentionally nonstandard, not silently repaired.

All three Wii RCD failures are mole sizes 9/11/14 (maximum 8). The eyebrow/month errors are from different DS NCD detection attempts, not additional defects in those Wii fields. See evidence/randomization-compatibility/FIELD_COMPARISON.md and web/WII_COMPATIBILITY.md. These samples contain Random/Mii Editor names and the editor's inherited system ID; decoder acceptance is not hardware certification.
