"""
DataChat - Chart Generator & Manager
Handles chart file management, base64 conversion, and cleanup.
"""

import os
import base64
import uuid
from typing import List, Dict, Optional
from datetime import datetime

CHARTS_DIR = os.getenv("CHARTS_DIR", "./charts")


# ==================== CONVERT CHART TO BASE64 ====================
def chart_to_base64(chart_path: str) -> Optional[str]:
    """Convert a chart PNG to base64 string for frontend display."""
    if not chart_path or not os.path.exists(chart_path):
        return None
    try:
        with open(chart_path, "rb") as img_file:
            encoded = base64.b64encode(img_file.read()).decode("utf-8")
            return f"data:image/png;base64,{encoded}"
    except Exception as e:
        print(f"⚠️  Failed to encode chart: {e}")
        return None


# ==================== GET CHART URL ====================
def get_chart_url(chart_path: str, base_url: str = "") -> Optional[str]:
    """Return a public URL for a chart file."""
    if not chart_path or not os.path.exists(chart_path):
        return None
    filename = os.path.basename(chart_path)
    return f"{base_url}/charts/{filename}"


# ==================== LIST ALL CHARTS FOR A USER ====================
def list_user_charts(user_id: int) -> List[Dict]:
    """List all charts saved for a specific user."""
    os.makedirs(CHARTS_DIR, exist_ok=True)
    charts = []
    prefix = f"chart_"  # Charts have UUID-based names
    for filename in sorted(os.listdir(CHARTS_DIR), reverse=True):
        if filename.startswith(prefix) and filename.endswith(".png"):
            path = os.path.join(CHARTS_DIR, filename)
            stats = os.stat(path)
            charts.append({
                "filename": filename,
                "path": path,
                "size_kb": round(stats.st_size / 1024, 2),
                "created_at": datetime.fromtimestamp(stats.st_mtime).isoformat(),
            })
    return charts


# ==================== DELETE CHART ====================
def delete_chart(chart_path: str) -> bool:
    """Delete a chart file."""
    try:
        if chart_path and os.path.exists(chart_path):
            os.remove(chart_path)
            return True
    except Exception as e:
        print(f"⚠️  Failed to delete chart: {e}")
    return False


# ==================== CLEAN OLD CHARTS (Optional - runs periodically) ====================
def clean_old_charts(days_old: int = 30):
    """Delete charts older than N days to save disk space."""
    if not os.path.exists(CHARTS_DIR):
        return 0
    now = datetime.now().timestamp()
    cutoff = now - (days_old * 86400)
    deleted = 0
    for filename in os.listdir(CHARTS_DIR):
        path = os.path.join(CHARTS_DIR, filename)
        if os.path.isfile(path) and os.path.getmtime(path) < cutoff:
            try:
                os.remove(path)
                deleted += 1
            except Exception:
                pass
    return deleted