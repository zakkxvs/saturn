"""Preset parsing + rule matching + compatibility package builder."""
import io
import json
import re
import zipfile
from datetime import datetime, timezone
from typing import Any
from xml.etree import ElementTree as ET

from rules_data import RULES, rule_applies, rule_severity, AE_VERSIONS


SEVERITY_LABELS = {
    "compatible": "compatible",
    "flagged": "flagged",
    "fallback": "fallback",
    "manual_todo": "manual_todo",
}


def _extract_text_from_bytes(data: bytes) -> str:
    """Best-effort readable text extraction from any file (including binary .ffx)."""
    try:
        # Try utf-8 first
        return data.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def _detect_source_version(text: str) -> str | None:
    """Heuristic AE version detection from preset headers/metadata."""
    for v in reversed(AE_VERSIONS):  # prefer newest match
        pat = rf"\b(?:AE|AfterEffects|After Effects)?\s*{re.escape(v)}\b"
        if re.search(pat, text):
            return v
    m = re.search(r"AE\s*version[\"'>=: ]+([A-Za-z0-9]+)", text, re.I)
    if m and m.group(1) in AE_VERSIONS:
        return m.group(1)
    return None


def _extract_properties_xml(text: str) -> list[dict]:
    """Extract property nodes from an XML preset."""
    props: list[dict] = []
    try:
        root = ET.fromstring(text)
    except ET.ParseError:
        return props
    for el in root.iter():
        tag = el.tag.split("}")[-1]
        entry: dict[str, Any] = {"tag": tag, "attrib": dict(el.attrib)}
        if el.text and el.text.strip():
            entry["text"] = el.text.strip()[:400]
        props.append(entry)
    return props


def _extract_properties_json(text: str) -> list[dict]:
    try:
        data = json.loads(text)
    except Exception:
        return []
    out: list[dict] = []

    def walk(node, path=""):
        if isinstance(node, dict):
            for k, v in node.items():
                out.append({"tag": k, "path": f"{path}.{k}", "value": _stringify(v)})
                walk(v, f"{path}.{k}")
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, f"{path}[{i}]")

    walk(data)
    return out


def _stringify(v):
    try:
        s = json.dumps(v)
        return s if len(s) < 400 else s[:397] + "..."
    except Exception:
        return str(v)[:400]


def _rule_matches(rule: dict, text: str, properties: list[dict]) -> bool:
    detect = rule.get("detect", {})
    matches = detect.get("match", [])
    if detect.get("type") == "keyword":
        return any(kw.lower() in text.lower() for kw in matches)
    if detect.get("type") == "attr":
        # match against any property tag/attrib/value
        blob = json.dumps(properties).lower()
        return any(m.lower() in blob for m in matches)
    return False


def analyze_preset(
    filename: str,
    content: bytes,
    target_version: str,
    target_os: str,
    safe_conversion: bool,
) -> dict:
    """Analyze a preset file and return a compatibility report."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    text = _extract_text_from_bytes(content)

    if ext == "xml":
        properties = _extract_properties_xml(text)
        format_type = "xml"
    elif ext == "json":
        properties = _extract_properties_json(text)
        format_type = "json"
    else:
        # .ffx or unknown: only extractable text/metadata
        properties = [{"tag": "raw_string", "text": s[:200]} for s in re.findall(r"[\x20-\x7e]{6,}", text)[:50]]
        format_type = "ffx" if ext == "ffx" else "unknown"

    source_version = _detect_source_version(text)

    findings = {"compatible": [], "flagged": [], "fallback": [], "manual_todo": []}
    triggered_rule_ids: list[str] = []

    for rule in RULES:
        if not _rule_matches(rule, text, properties):
            continue
        triggered_rule_ids.append(rule["id"])
        if not rule_applies(rule, target_version, target_os):
            findings["compatible"].append({
                "rule_id": rule["id"],
                "title": rule["title"],
                "category": rule["category"],
                "notes": rule["notes"],
            })
            continue
        severity = rule_severity(rule, target_version, target_os)
        entry = {
            "rule_id": rule["id"],
            "title": rule["title"],
            "category": rule["category"],
            "notes": rule["notes"],
            "manual_steps": rule.get("manual_steps", []),
            "fallback_applied": None,
        }
        if severity == "manual_todo":
            findings["manual_todo"].append(entry)
        elif severity == "flagged":
            if safe_conversion and rule.get("fallback"):
                entry["fallback_applied"] = rule["fallback"]
                findings["fallback"].append(entry)
            else:
                findings["flagged"].append(entry)
        else:
            findings["compatible"].append(entry)

    # Any rule NOT triggered but that is "compatible" is noise - skip.
    summary = {
        "filename": filename,
        "format": format_type,
        "size_bytes": len(content),
        "source_version_detected": source_version,
        "target_version": target_version,
        "target_os": target_os,
        "safe_conversion": safe_conversion,
        "counts": {k: len(v) for k, v in findings.items()},
        "total_properties_extracted": len(properties),
        "triggered_rule_ids": triggered_rule_ids,
    }

    return {
        "summary": summary,
        "findings": findings,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def build_package_zip(
    original_filename: str,
    original_content: bytes,
    report: dict,
) -> bytes:
    """Build a .zip compatibility package."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(f"original/{original_filename}", original_content)
        zf.writestr("report.json", json.dumps(report, indent=2))
        zf.writestr("notes.md", _notes_markdown(report))
        zf.writestr("README.txt", (
            "Saturn / PresetBridge compatibility package\n"
            "-------------------------------------------\n"
            "This package does NOT rewrite binary .ffx files. It contains:\n"
            "  - original/ : the preset you uploaded, untouched\n"
            "  - report.json : machine-readable compatibility report\n"
            "  - notes.md : human-readable fallback notes + manual steps\n\n"
            "Open notes.md first.\n"
        ))
    return buf.getvalue()


def _notes_markdown(report: dict) -> str:
    s = report["summary"]
    lines = [
        f"# Compatibility notes — {s['filename']}",
        "",
        f"- **Format:** {s['format']}",
        f"- **Target AE:** {s['target_version']} ({s['target_os']})",
        f"- **Source AE detected:** {s['source_version_detected'] or 'unknown'}",
        f"- **Safe conversion:** {'on' if s['safe_conversion'] else 'off'}",
        "",
        "## Summary",
        f"- Compatible: {s['counts']['compatible']}",
        f"- Flagged: {s['counts']['flagged']}",
        f"- Fallbacks applied: {s['counts']['fallback']}",
        f"- Manual TODOs: {s['counts']['manual_todo']}",
        "",
    ]

    def section(name, items):
        if not items:
            return
        lines.append(f"## {name}")
        for it in items:
            lines.append(f"### {it['title']}  \n_category: `{it['category']}` · rule: `{it['rule_id']}`_")
            lines.append(it.get("notes", ""))
            if it.get("fallback_applied"):
                lines.append(f"**Fallback applied:** `{it['fallback_applied']}`")
            if it.get("manual_steps"):
                lines.append("**Manual steps:**")
                for st in it["manual_steps"]:
                    lines.append(f"- {st}")
            lines.append("")

    section("Manual TODOs (must fix by hand)", report["findings"]["manual_todo"])
    section("Flagged (review)", report["findings"]["flagged"])
    section("Fallbacks applied", report["findings"]["fallback"])
    section("Compatible", report["findings"]["compatible"])

    lines.append("---")
    lines.append("_Generated by Saturn / PresetBridge. This tool analyzes presets and produces a compatibility package — it does not rewrite binary .ffx files._")
    return "\n".join(lines)
