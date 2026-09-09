"""Hand-curated compatibility rules for After Effects preset migration.

Each rule describes a property/expression/effect and its behavior across AE versions.
"""

# AE version ordering (canonical). We use ordinal comparison for ranges.
AE_VERSIONS = [
    "CS6", "CC2014", "CC2015", "CC2017", "CC2018",
    "CC2019", "CC2020", "2021", "2022", "2023", "2024", "2025",
]


def version_index(v: str) -> int:
    try:
        return AE_VERSIONS.index(v)
    except ValueError:
        return -1


RULES = [
    {
        "id": "expr-engine-js",
        "category": "expression_engine",
        "title": "JavaScript expression engine",
        "detect": {"type": "keyword", "match": ["thisComp", "linear(", "wiggle(", "loopOut(", "ease(", "valueAtTime"]},
        "introduced_in": "CC2019",
        "severity_below": "flagged",
        "fallback": "legacy_extendscript_shim",
        "notes": "Target uses the modern JS expression engine. Older AE versions default to the ExtendScript engine which has subtle numerical/string differences.",
        "manual_steps": [
            "Open Project Settings → Expressions and set engine to 'JavaScript' if available on the target machine.",
            "Verify Math.round/floor/ceil edge cases if using ExtendScript."
        ]
    },
    {
        "id": "text-per-char-3d",
        "category": "text_animator",
        "title": "Per-character 3D text",
        "detect": {"type": "attr", "match": ["enable_per_character_3d", "perCharacter3D"]},
        "introduced_in": "CS6",
        "severity_below": "flagged",
        "fallback": "flatten_to_2d",
        "notes": "Per-character 3D is available across all supported versions but requires a 3D-enabled composition.",
        "manual_steps": ["Ensure the target composition has at least one 3D layer or camera present."]
    },
    {
        "id": "essential-graphics",
        "category": "essential_graphics",
        "title": "Essential Graphics / Master Properties",
        "detect": {"type": "attr", "match": ["masterProperty", "essentialGraphics", "mogrt"]},
        "introduced_in": "CC2018",
        "severity_below": "manual_todo",
        "fallback": None,
        "notes": "Master Properties and .mogrt export are not available before CC2018.",
        "manual_steps": [
            "Recreate the preset controls using Expression Controls (Slider/Angle/Point) for CS6-CC2017 targets.",
        ]
    },
    {
        "id": "responsive-design-time",
        "category": "responsive",
        "title": "Responsive Design – Time",
        "detect": {"type": "attr", "match": ["responsiveDesign", "protectedRegion"]},
        "introduced_in": "CC2019",
        "severity_below": "manual_todo",
        "fallback": None,
        "notes": "Responsive Design – Time / protected regions require CC2019+.",
        "manual_steps": ["Bake keyframes to fixed timings or split into pre-comps for older AE."]
    },
    {
        "id": "3d-camera-tracker",
        "category": "camera",
        "title": "3D Camera Tracker keyframes",
        "detect": {"type": "attr", "match": ["cameraTracker", "trackedCamera"]},
        "introduced_in": "CS6",
        "severity_below": "compatible",
        "fallback": None,
        "notes": "Compatible across all listed AE versions.",
        "manual_steps": []
    },
    {
        "id": "layer-styles-gradient",
        "category": "layer_style",
        "title": "Gradient Overlay layer style",
        "detect": {"type": "attr", "match": ["gradientOverlay", "layerStyle:gradient"]},
        "introduced_in": "CS6",
        "severity_below": "compatible",
        "fallback": None,
        "notes": "Layer styles are stable across CS6→2025 but rasterize order changed in CC2015.",
        "manual_steps": ["If layer sits inside a pre-comp, verify collapse-transformations behavior."]
    },
    {
        "id": "content-aware-fill",
        "category": "video",
        "title": "Content-Aware Fill references",
        "detect": {"type": "attr", "match": ["contentAwareFill"]},
        "introduced_in": "CC2019",
        "severity_below": "manual_todo",
        "fallback": None,
        "notes": "Content-Aware Fill data cannot be regenerated on older versions.",
        "manual_steps": ["Bake fill result to a rendered layer before sharing to CS6-CC2018."]
    },
    {
        "id": "expr-sourceRectAtTime",
        "category": "expression_function",
        "title": "sourceRectAtTime()",
        "detect": {"type": "keyword", "match": ["sourceRectAtTime"]},
        "introduced_in": "CC2014",
        "severity_below": "flagged",
        "fallback": "manual_bounds_measurement",
        "notes": "sourceRectAtTime is not available in CS6.",
        "manual_steps": ["Replace with hard-coded rect values captured from the reference comp."]
    },
    {
        "id": "expr-posterizeTime",
        "category": "expression_function",
        "title": "posterizeTime()",
        "detect": {"type": "keyword", "match": ["posterizeTime("]},
        "introduced_in": "CS6",
        "severity_below": "compatible",
        "fallback": None,
        "notes": "Compatible across all listed versions.",
        "manual_steps": []
    },
    {
        "id": "wiggle-seed",
        "category": "expression_function",
        "title": "wiggle() with seedRandom",
        "detect": {"type": "keyword", "match": ["seedRandom", "wiggle("]},
        "introduced_in": "CS6",
        "severity_below": "compatible",
        "fallback": None,
        "notes": "wiggle/seedRandom are supported everywhere, though JS engine may produce different values than ExtendScript.",
        "manual_steps": ["Re-render preview if using JS engine after opening in ExtendScript target."]
    },
    {
        "id": "shape-taper-wave",
        "category": "shape_layer",
        "title": "Shape Layer taper / wave",
        "detect": {"type": "attr", "match": ["taper", "waveWidth", "shape:taper"]},
        "introduced_in": "CC2018",
        "severity_below": "flagged",
        "fallback": "convert_to_stroke",
        "notes": "Taper/Wave stroke was added in CC2018.",
        "manual_steps": ["Replace with a plain stroke and a manual width curve on older AE."]
    },
    {
        "id": "roto-brush-2",
        "category": "effect",
        "title": "Roto Brush 2",
        "detect": {"type": "attr", "match": ["rotoBrush2"]},
        "introduced_in": "CC2020",
        "severity_below": "manual_todo",
        "fallback": None,
        "notes": "Roto Brush 2 mattes cannot be recomputed on older versions.",
        "manual_steps": ["Bake to an alpha matte layer before sharing to older targets."]
    },
    {
        "id": "cinema4d-lite",
        "category": "renderer",
        "title": "Cinema 4D Lite renderer",
        "detect": {"type": "attr", "match": ["cinema4d", "c4dRenderer"]},
        "introduced_in": "CC2015",
        "severity_below": "manual_todo",
        "fallback": None,
        "notes": "C4D Lite renderer not available in CS6/CC2014.",
        "manual_steps": ["Switch composition renderer to Classic 3D or Ray-Traced 3D."]
    },
    {
        "id": "motion-graphics-templates",
        "category": "export",
        "title": ".mogrt export target",
        "detect": {"type": "attr", "match": ["mogrtExport"]},
        "introduced_in": "CC2018",
        "severity_below": "manual_todo",
        "fallback": None,
        "notes": "Motion Graphics Templates export requires CC2018+.",
        "manual_steps": ["Fall back to project (.aep) or preset (.ffx) distribution."]
    },
    {
        "id": "os-font-macos",
        "category": "os_specific",
        "title": "macOS system font references",
        "detect": {"type": "attr", "match": ["font:SFPro", "font:Helvetica Neue"]},
        "introduced_in": "CS6",
        "severity_below": "flagged",
        "fallback": "font_substitution_arial",
        "notes": "macOS-only fonts (SF Pro, Helvetica Neue) may be missing on Windows targets.",
        "manual_steps": ["Bundle an OFL font, or substitute with Arial/Segoe on Windows."],
        "os_target": "windows"
    },
    {
        "id": "os-font-windows",
        "category": "os_specific",
        "title": "Windows system font references",
        "detect": {"type": "attr", "match": ["font:Segoe", "font:Calibri"]},
        "introduced_in": "CS6",
        "severity_below": "flagged",
        "fallback": "font_substitution_helvetica",
        "notes": "Windows-only fonts (Segoe, Calibri) may be missing on macOS targets.",
        "manual_steps": ["Substitute with Helvetica Neue or bundle the font in the package."],
        "os_target": "macos"
    },
    {
        "id": "expression-slider-control",
        "category": "effect",
        "title": "Slider Control effect",
        "detect": {"type": "keyword", "match": ["Slider Control", "ADBE Slider Control"]},
        "introduced_in": "CS6",
        "severity_below": "compatible",
        "fallback": None,
        "notes": "Compatible across CS6→2025.",
        "manual_steps": []
    },
    {
        "id": "gpu-particles",
        "category": "effect",
        "title": "GPU-accelerated particle effects",
        "detect": {"type": "attr", "match": ["gpuParticle", "particleWorld:gpu"]},
        "introduced_in": "2022",
        "severity_below": "flagged",
        "fallback": "cpu_particle_fallback",
        "notes": "GPU particles require AE 2022+; older targets fall back to CPU compute (slower).",
        "manual_steps": ["Reduce particle count for CPU-only targets."]
    },
    {
        "id": "unicode-emoji-text",
        "category": "text_animator",
        "title": "Emoji / extended Unicode text",
        "detect": {"type": "attr", "match": ["emoji", "unicode:supplementary"]},
        "introduced_in": "CC2018",
        "severity_below": "flagged",
        "fallback": "strip_supplementary_glyphs",
        "notes": "Reliable Unicode SMP support landed in CC2018.",
        "manual_steps": ["Replace emoji with graphic layers for older targets."]
    },
    {
        "id": "essential-sound-panel",
        "category": "audio",
        "title": "Essential Sound tags",
        "detect": {"type": "attr", "match": ["essentialSound"]},
        "introduced_in": "CC2019",
        "severity_below": "manual_todo",
        "fallback": None,
        "notes": "Essential Sound tagging is Premiere-only; ignored by AE anyway. Safe to strip.",
        "manual_steps": []
    },
]


def rule_applies(rule: dict, target_version: str, target_os: str) -> bool:
    """Return True if the rule is triggered given target constraints."""
    idx_target = version_index(target_version)
    idx_intro = version_index(rule.get("introduced_in", "CS6"))
    if idx_target == -1 or idx_intro == -1:
        return True
    # Rule is relevant if target is BELOW the introduction version
    if idx_target < idx_intro:
        return True
    # OS-specific rules apply only when os matches
    if rule.get("os_target") and rule.get("os_target") == target_os:
        return True
    return False


def rule_severity(rule: dict, target_version: str, target_os: str) -> str:
    if version_index(target_version) < version_index(rule.get("introduced_in", "CS6")):
        return rule.get("severity_below", "flagged")
    if rule.get("os_target") == target_os:
        return "flagged"
    return "compatible"
