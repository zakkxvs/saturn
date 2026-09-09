"""Sample presets shipped with the app for one-click testing."""

SAMPLES = [
    {
        "id": "sample-glow",
        "filename": "Glow_Warmth.xml",
        "label": "Warm Glow",
        "description": "Simple glow effect with radius + intensity keyframes.",
        "content": """<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Preset name=\"WarmGlow\" ae_version=\"CC2020\">
  <Layer type=\"adjustment\">
    <Effect name=\"Glow\">
      <Property name=\"Glow Threshold\" value=\"60%\"/>
      <Property name=\"Glow Radius\" value=\"25\"/>
      <Property name=\"Glow Intensity\" value=\"1.2\"/>
      <Expression>wiggle(2, 0.5)</Expression>
    </Effect>
    <Effect name=\"gradientOverlay\">
      <Property name=\"Colors\" value=\"#F59E0B,#FF6B00\"/>
    </Effect>
  </Layer>
</Preset>
"""
    },
    {
        "id": "sample-camera-rig",
        "filename": "Complex_Camera_Rig.xml",
        "label": "Complex Camera Rig",
        "description": "3D camera with tracked keyframes, per-character 3D text, and Master Property controls.",
        "content": """<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Preset name=\"CameraRig\" ae_version=\"2024\">
  <Layer type=\"camera\">
    <Property name=\"cameraTracker\" enabled=\"true\"/>
    <Property name=\"trackedCamera\" enabled=\"true\"/>
  </Layer>
  <Layer type=\"text\">
    <Property name=\"perCharacter3D\" enabled=\"true\"/>
    <Property name=\"font:SFPro\" size=\"64\"/>
    <Expression>sourceRectAtTime(time, false)</Expression>
  </Layer>
  <Layer type=\"controller\">
    <Property name=\"masterProperty\" name2=\"Wobble Amount\" default=\"0.5\"/>
    <Property name=\"essentialGraphics\" export=\"true\"/>
  </Layer>
</Preset>
"""
    },
    {
        "id": "sample-typewriter",
        "filename": "Text_Typewriter_Wiggle.json",
        "label": "Typewriter + Wiggle",
        "description": "Typewriter reveal with wiggle jitter and per-character 3D flags.",
        "content": """{
  \"preset\": \"TypewriterWiggle\",
  \"ae_version\": \"CC2019\",
  \"layers\": [
    {
      \"type\": \"text\",
      \"perCharacter3D\": true,
      \"font\": \"font:Segoe UI\",
      \"animator\": {
        \"expression\": \"wiggle(3, 4) + seedRandom(index, true)\",
        \"posterizeTime\": \"posterizeTime(12)\"
      }
    }
  ],
  \"responsiveDesign\": {
    \"protectedRegion\": [0.2, 0.8]
  }
}
"""
    },
    {
        "id": "sample-glitch",
        "filename": "Universal_Glitch_Rig.xml",
        "label": "Universal Glitch Rig",
        "description": "Glitch composite using shape taper, GPU particles and Roto Brush 2 matte.",
        "content": """<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Preset name=\"GlitchRig\" ae_version=\"2024\">
  <Layer type=\"shape\">
    <Property name=\"taper\" value=\"0.4\"/>
    <Property name=\"waveWidth\" value=\"12\"/>
  </Layer>
  <Layer type=\"effect\">
    <Property name=\"gpuParticle\" enabled=\"true\"/>
    <Property name=\"rotoBrush2\" enabled=\"true\"/>
  </Layer>
  <Expression>thisComp.layer(\"Ctrl\").effect(\"Slider Control\")(\"Slider\")</Expression>
</Preset>
"""
    },
]
