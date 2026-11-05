#!/usr/bin/env python3
"""Read original SWFs through FFDec XML; emit static, lossless-source-backed manifests.

Does not execute ActionScript or write to SOURCE/ or EXTRACTED-SWF/.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import json
from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET
from collections import Counter

IDENTITY = [1, 0, 0, 1, 0, 0]
COLOR_IDENTITY = {"multipliers": [1, 1, 1, 1], "offsets": [0, 0, 0, 0]}
IDS = ("shapeId", "spriteId", "buttonId", "characterID", "characterId", "textId", "fontID", "fontId")
DEFINITIONS = {"DefineShapeTag", "DefineShape2Tag", "DefineShape3Tag", "DefineShape4Tag", "DefineSpriteTag", "DefineTextTag", "DefineText2Tag", "DefineEditTextTag", "DefineButtonTag", "DefineButton2Tag", "DefineBitsTag", "DefineBitsJPEG2Tag", "DefineBitsJPEG3Tag", "DefineBitsJPEG4Tag", "DefineBitsLosslessTag", "DefineBitsLossless2Tag", "DefineFontTag", "DefineFont2Tag", "DefineFont3Tag", "DefineFont4Tag"}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def raw(element):
    """Preserve XML ordering, attributes, text and children, including unknown fields."""
    return {"element": element.tag, "attributes": dict(element.attrib),
            **({"text": element.text} if element.text and element.text.strip() else {}),
            "children": [raw(child) for child in element]}


def fixed(value):
    # SWF MATRIX values are signed 16.16; undo FFDec decimal float formatting.
    return round(float(value) * 65536) / 65536


def matrix(element):
    if element is None:
        return IDENTITY.copy()
    a = element.attrib
    return [fixed(a.get("scaleX", "1")), fixed(a.get("rotateSkew0", "0")),
            fixed(a.get("rotateSkew1", "0")), fixed(a.get("scaleY", "1")),
            int(a.get("translateX", 0)) / 20, int(a.get("translateY", 0)) / 20]


def color(element):
    if element is None:
        return copy.deepcopy(COLOR_IDENTITY)
    a = element.attrib
    return {"multipliers": [int(a.get(c + "MultTerm", 256)) / 256 for c in ("red", "green", "blue", "alpha")],
            "offsets": [int(a.get(c + "AddTerm", 0)) for c in ("red", "green", "blue", "alpha")]}


def rect(element):
    a = element.attrib
    return {"x": int(a["Xmin"]) / 20, "y": int(a["Ymin"]) / 20,
            "width": (int(a["Xmax"]) - int(a["Xmin"])) / 20,
            "height": (int(a["Ymax"]) - int(a["Ymin"])) / 20,
            "twips": {k: int(a[k]) for k in ("Xmin", "Xmax", "Ymin", "Ymax")}}


def timeline(tags, frame_count):
    """Resolve each local timeline's depth state; never simulate nested playback/AS3."""
    depths, frames, operations, labels = {}, [], [], []
    for index, tag in enumerate(tags):
        typ, a = tag.get("type"), tag.attrib
        if typ in ("PlaceObjectTag", "PlaceObject2Tag", "PlaceObject3Tag", "PlaceObject4Tag"):
            depth = int(a["depth"])
            move = a.get("placeFlagMove") == "true"
            if move and depth not in depths:
                raise ValueError(f"Move targets absent depth {depth}")
            state = copy.deepcopy(depths[depth]) if move else {
                "depth": depth, "matrixPx": IDENTITY.copy(), "colorTransform": copy.deepcopy(COLOR_IDENTITY),
                "ratio": 0, "clipDepth": None, "name": None, "blendMode": 1,
                "filters": [], "visible": True, "cacheAsBitmap": 0,
            }
            for attr in ("characterId", "name", "ratio", "clipDepth", "blendMode", "bitmapCache", "className", "visible"):
                if attr in a:
                    key = "cacheAsBitmap" if attr == "bitmapCache" else attr
                    state[key] = a[attr] if attr in ("name", "className") else (a[attr] == "true" if attr == "visible" else int(a[attr]))
            if tag.find("matrix") is not None:
                state["matrixPx"] = matrix(tag.find("matrix"))
            if tag.find("colorTransform") is not None:
                state["colorTransform"] = color(tag.find("colorTransform"))
            if tag.find("surfaceFilterList") is not None:
                state["filters"] = [raw(x) for x in tag.find("surfaceFilterList")]
            if tag.find("backgroundColor") is not None:
                state["opaqueBackground"] = raw(tag.find("backgroundColor"))
            if "characterId" not in state:
                raise ValueError(f"Placement at depth {depth} lacks character")
            state["lastPlacementTagIndex"] = index
            depths[depth] = state
            operations.append({"tagIndex": index, "kind": "move" if move else "place", "raw": raw(tag)})
        elif typ in ("RemoveObjectTag", "RemoveObject2Tag"):
            depth = int(a["depth"])
            if depth not in depths:
                raise ValueError(f"Remove targets absent depth {depth}")
            del depths[depth]
            operations.append({"tagIndex": index, "kind": "remove", "raw": raw(tag)})
        elif typ == "FrameLabelTag":
            labels.append(a["name"])
        elif typ == "ShowFrameTag":
            frames.append({"frame": len(frames) + 1, "labels": labels,
                           "operations": operations, "displayList": [copy.deepcopy(depths[d]) for d in sorted(depths)]})
            operations, labels = [], []
    if len(frames) != frame_count:
        raise ValueError(f"Expected {frame_count} frames, recovered {len(frames)}")
    if operations or labels:
        raise ValueError("Uncommitted timeline operations after final ShowFrame")
    return {"frameCount": frame_count, "frames": frames}


def export_paths(project, module, symbol_id):
    base = project / "EXTRACTED-SWF" / f"{module}.swf"
    paths = []
    for kind, suffix in (("shapes", ".svg"), ("texts", ".txt"), ("images", ".jpg")):
        p = base / kind / f"{symbol_id}{suffix}"
        if p.exists():
            paths.append(str(p.relative_to(project)))
    for kind in ("sprites", "buttons", "fonts"):
        if not (base / kind).exists():
            continue
        for p in sorted((base / kind).iterdir()):
            if re.match(rf"(?:DefineSprite_|DefineButton2_|DefineButton_)?{symbol_id}(?:_|\.|$)", p.name):
                paths.append(str(p.relative_to(project)))
    return paths


def recover(project, xml_path, module):
    root = ET.parse(xml_path).getroot()
    if (root.get("_xmlExportMajor"), root.get("_xmlExportMinor")) != ("4", "2"):
        raise ValueError("This reader is tested against FFDec XML schema 4.2 only")
    tags = list(root.find("tags"))
    registrations = {}
    for tag in tags:
        if tag.get("type") == "SymbolClassTag":
            ids, names = list(tag.find("tags")), list(tag.find("names"))
            if len(ids) != len(names):
                raise ValueError("Unpaired SymbolClass entries")
            registrations.update({int(i.text): n.text for i, n in zip(ids, names)})
    symbols = {}
    for index, tag in enumerate(tags):
        typ = tag.get("type")
        if typ not in DEFINITIONS:
            continue
        sid = next((int(tag.get(k)) for k in IDS if tag.get(k) is not None), None)
        if sid is None or str(sid) in symbols:
            raise ValueError(f"Missing/duplicate definition ID: {typ} {sid}")
        item = {"id": sid, "kind": typ, "className": registrations.get(sid),
                "registrationPoint": {"x": 0, "y": 0, "meaning": "symbol-local origin; not a guessed bounding-box center"},
                "rawXmlTagIndex": index, "extractedExports": export_paths(project, module, sid),
                "rawDefinition": raw(tag)}
        item["bounds"] = {c.tag: rect(c) for c in tag if c.get("type") == "RECT"}
        svg_path = project / "EXTRACTED-SWF" / f"{module}.swf" / "shapes" / f"{sid}.svg"
        if svg_path.exists():
            svg = ET.parse(svg_path).getroot()
            item["svgExport"] = {"path": str(svg_path.relative_to(project)), "sha256": digest(svg_path),
                                 "rootAttributes": dict(svg.attrib),
                                 "topLevelGroupTransforms": [c.get("transform") for c in svg if c.tag.endswith("}g")],
                                 "note": "Export includes origin compensation; do not apply it twice when composing symbol-local paths."}
        if typ == "DefineSpriteTag":
            item["timeline"] = timeline(list(tag.find("subTags")), int(tag.get("frameCount")))
        if typ in ("DefineButtonTag", "DefineButton2Tag"):
            item["buttonRecords"] = [{"characterId": int(c.get("characterId")), "depth": int(c.get("placeDepth")),
                                      "states": [state for state in ("Up", "Over", "Down", "HitTest") if c.get("buttonState" + state) == "true"],
                                      "matrixPx": matrix(c.find("placeMatrix")), "colorTransform": color(c.find("colorTransform")),
                                      "raw": raw(c)} for c in tag.find("characters")]
        symbols[str(sid)] = item
    references = set()
    timelines = [timeline(tags, int(root.get("frameCount")))] + [v["timeline"] for v in symbols.values() if "timeline" in v]
    for tl in timelines:
        for frame in tl["frames"]:
            for placement in frame["displayList"]:
                references.add(placement["characterId"])
    for value in symbols.values():
        for record in value.get("buttonRecords", []):
            references.add(record["characterId"])
    missing = sorted(references - {int(s) for s in symbols})
    if missing:
        raise ValueError(f"Unresolved display references: {missing}")
    source = project / "SOURCE" / f"{module}.swf"
    return {"schemaVersion": 1, "module": module,
            "source": {"path": str(source.relative_to(project)), "sha256": digest(source), "bytes": source.stat().st_size},
            "xmlExport": {"path": f"evidence/raw/{module}.xml", "sha256": digest(xml_path), "generator": root.get("_generator"), "schema": "4.2"},
            "coordinates": {"twipsPerPixel": 20, "matrixOrder": "[a,b,c,d,tx,ty] matching SVG/CSS affine conventions; translations in pixels", "rawUnits": "Original XML/rawDefinition keeps twips and SWF terms"},
            "stage": {"bounds": rect(root.find("displayRect")), "fps": float(root.get("frameRate")), "swfVersion": int(root.get("version"))},
            "registrations": {str(k): v for k, v in sorted(registrations.items())},
            "rootTimeline": timelines[0], "symbols": symbols,
            "scalingGrids": [raw(t) for t in tags if t.get("type") == "DefineScalingGridTag"],
            "tagCountsRecursive": dict(sorted(Counter(t.get("type") for t in root.iter("item") if (t.get("type") or "").endswith("Tag")).items())),
            "validation": {"unresolvedPlacementReferences": missing, "timelineCount": len(timelines), "totalFrames": sum(t["frameCount"] for t in timelines)},
            "limitations": ["Static local timelines before AS3 initialization; not runtime screenshots or recursively evaluated child playback.",
                            "No synthetic runtime bounds or center pivots; bounds from shape/text definitions and explicit transforms only.",
                            "Raw definitions retain shape styles/edges, glyph records, button actions, filters and unknown fields; renderer support is separate.",
                            "Non-definition tag data and executable AS3 remain in the full raw XML. No AS3 was executed."]}


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=True) + "\n")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--project-root", type=Path, default=Path(__file__).resolve().parents[1])
    ap.add_argument("--output", type=Path, help="Defaults to PROJECT/evidence")
    ap.add_argument("--ffdec", type=Path, default=Path("/Applications/FFDec.app/Contents/Resources/ffdec-cli.jar"))
    ap.add_argument("--from-xml", action="store_true", help="Normalize existing evidence/raw exports without running FFDec")
    args = ap.parse_args()
    project = args.project_root.resolve()
    out = (args.output or project / "evidence").resolve()
    if any(out == project / d or project / d in out.parents for d in ("SOURCE", "EXTRACTED-SWF")):
        raise ValueError("Output must not be inside protected inputs")
    for name in ("assets", "classicGUI"):
        xml_path = out / "raw" / f"{name}.xml"
        xml_path.parent.mkdir(parents=True, exist_ok=True)
        if not args.from_xml:
            subprocess.run(["java", "-jar", str(args.ffdec), "-swf2xml", str(project / "SOURCE" / f"{name}.swf"), str(xml_path)], check=True)
        manifest = recover(project, xml_path, name)
        write_json(out / "manifests" / f"{name}.json", manifest)
        print(name, len(manifest["symbols"]), "symbols;", manifest["validation"])
    path = project / "EXTRACTED-SWF/classicGUI.swf/scripts/mii/authoring/ClassicGUI.as"
    code = path.read_text()
    match = re.search(r'public var hexData:String = "([0-9a-f]{148})";', code)
    if match is None:
        raise ValueError("Expected one 74-byte default hex literal in ClassicGUI.as")
    write_json(out / "default-character.json", {"source": str(path.relative_to(project)), "sourceSha256": digest(path), "hex": match[1], "name": bytes.fromhex(match[1])[2:22].decode("utf-16-be").replace("\0", "")})

if __name__ == "__main__":
    main()
