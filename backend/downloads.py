"""Downloads endpoints for the Saturn product site.

Serves a real placeholder ZIP for macOS and Windows so the download flow works
end-to-end. Real installers can replace these builds later without any code
changes — just drop the file into /app/backend/builds/{os}/ and point the
BUILD_FILE_MAP at it.
"""
import hashlib
import io
import json
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response


APP_VERSION = "1.0.0-beta.3"
RELEASE_DATE = "2026-02-14"

BUILDS = {
    "macos": {
        "os": "macos",
        "label": "macOS",
        "arch": "Universal (Apple Silicon + Intel)",
        "min_version": "macOS 12 Monterey",
        "filename": f"Saturn-{APP_VERSION}-macOS.zip",
        "ext": "zip",
    },
    "windows": {
        "os": "windows",
        "label": "Windows",
        "arch": "x64",
        "min_version": "Windows 10 (build 19041+)",
        "filename": f"Saturn-{APP_VERSION}-Windows.zip",
        "ext": "zip",
    },
}


def _build_placeholder_zip(os_key: str) -> bytes:
    b = BUILDS[os_key]
    readme = f"""Saturn {APP_VERSION} — {b['label']} installer (placeholder)
===============================================================

Thanks for downloading Saturn / PresetBridge.

This archive is a placeholder for the real {b['label']} installer.
It contains everything the site knows about the current build so you can
verify integrity and see what's coming when the signed binary ships.

Build:      {APP_VERSION}
Released:   {RELEASE_DATE}
Target OS:  {b['label']}
Arch:       {b['arch']}
Minimum:    {b['min_version']}

What ships in the real installer
--------------------------------
- Saturn.app / Saturn.exe (native shell around the compatibility engine)
- Bundled rules engine v1 (20+ AE compatibility rules, offline)
- Update channel: stable
- Auto-updater (opt-in)
- Command-line: `saturn analyze <preset> --target CC2018`

Getting notified when the real installer drops
----------------------------------------------
Subscribe on saturn.dev — you'll get one email per release, nothing else.

— Saturn Labs
"""
    manifest = {
        "product": "Saturn / PresetBridge",
        "version": APP_VERSION,
        "released": RELEASE_DATE,
        "os": b["os"],
        "arch": b["arch"],
        "min_os_version": b["min_version"],
        "placeholder": True,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("README.txt", readme)
        zf.writestr("manifest.json", json.dumps(manifest, indent=2))
        zf.writestr("LICENSE.txt", "Saturn / PresetBridge — © 2026 Saturn Labs. All rights reserved.\n")
    return buf.getvalue()


# Cache the placeholder builds + their hashes at module load time.
_BUILD_CACHE: dict[str, dict] = {}
for k in BUILDS:
    data = _build_placeholder_zip(k)
    _BUILD_CACHE[k] = {
        "bytes": data,
        "size": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
    }


def build_downloads_router(db) -> APIRouter:
    router = APIRouter(prefix="/downloads", tags=["downloads"])

    @router.get("")
    async def list_builds():
        stats = {}
        cursor = db.download_stats.find({}, {"_id": 0})
        async for doc in cursor:
            stats[doc["os"]] = doc.get("count", 0)
        return {
            "product": "Saturn / PresetBridge",
            "version": APP_VERSION,
            "released": RELEASE_DATE,
            "builds": [
                {
                    **BUILDS[k],
                    "version": APP_VERSION,
                    "released": RELEASE_DATE,
                    "size_bytes": _BUILD_CACHE[k]["size"],
                    "sha256": _BUILD_CACHE[k]["sha256"],
                    "download_count": stats.get(k, 0),
                    "placeholder": True,
                }
                for k in ("macos", "windows")
            ],
            "total_downloads": sum(stats.values()),
        }

    @router.get("/stats")
    async def stats():
        agg = {}
        cursor = db.download_stats.find({}, {"_id": 0})
        async for doc in cursor:
            agg[doc["os"]] = doc.get("count", 0)
        return {"total": sum(agg.values()), "by_os": agg}

    @router.get("/{os_key}")
    async def download(os_key: str, request: Request):
        os_key = os_key.lower()
        if os_key not in BUILDS:
            raise HTTPException(status_code=404, detail="unknown build target")
        entry = _BUILD_CACHE[os_key]
        # Log a lightweight, anonymised event
        ip = request.client.host if request.client else "unknown"
        ua = request.headers.get("user-agent", "")[:200]
        await db.downloads.insert_one({
            "id": str(uuid.uuid4()),
            "os": os_key,
            "version": APP_VERSION,
            "ip_hash": hashlib.sha256(ip.encode()).hexdigest()[:16],
            "user_agent": ua,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        await db.download_stats.update_one(
            {"os": os_key},
            {"$inc": {"count": 1}, "$set": {"last_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        return Response(
            content=entry["bytes"],
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{BUILDS[os_key]["filename"]}"',
                "X-Saturn-Version": APP_VERSION,
                "X-Saturn-Placeholder": "true",
            },
        )

    return router
