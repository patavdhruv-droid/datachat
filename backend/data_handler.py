"""
DataChat - Data Handler Module
Handles CSV/Excel uploads and SAFELY executes AI-generated Python code.
The most critical security file in the entire app.
"""

import os
import json
import uuid
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend (required for server)
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64
from typing import Tuple, Dict, Any, Optional
import traceback

# Set premium chart style
sns.set_style("whitegrid")
plt.rcParams.update({
    'figure.figsize': (10, 6),
    'figure.dpi': 100,
    'axes.titlesize': 14,
    'axes.titleweight': 'bold',
    'axes.labelsize': 11,
    'axes.spines.top': False,
    'axes.spines.right': False,
    'font.family': 'DejaVu Sans',
})

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
CHARTS_DIR = os.getenv("CHARTS_DIR", "./charts")


# ==================== FILE UPLOAD ====================
def save_uploaded_file(file_bytes: bytes, original_filename: str, user_id: int) -> Tuple[str, str]:
    """Save uploaded file with unique name. Returns (saved_path, unique_filename)."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(original_filename)[1].lower()
    unique_name = f"user{user_id}_{uuid.uuid4().hex[:12]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    return file_path, unique_name


# ==================== READ DATASET ====================
def read_dataset(file_path: str) -> pd.DataFrame:
    """Read CSV or Excel file as DataFrame."""
    ext = os.path.splitext(file_path)[1].lower()
    try:
        if ext == ".csv":
            # Try multiple encodings for robustness
            try:
                df = pd.read_csv(file_path, encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(file_path, encoding="latin-1")
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")
        return df
    except Exception as e:
        raise ValueError(f"Failed to read file: {str(e)}")


# ==================== ANALYZE DATASET METADATA ====================
def analyze_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """Extract metadata about the dataset (rows, cols, types, missing, etc.)"""
    column_info = []
    for col in df.columns:
        column_info.append({
            "name": str(col),
            "dtype": str(df[col].dtype),
            "missing": int(df[col].isnull().sum()),
            "unique": int(df[col].nunique()),
        })

    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": [str(c) for c in df.columns],
        "column_types": {str(c): str(df[c].dtype) for c in df.columns},
        "missing_values": int(df.isnull().sum().sum()),
        "memory_mb": round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2),
        "column_info": column_info,
        "preview": df.head(5).fillna("").astype(str).to_dict(orient="records"),
    }


# ==================== PREVIEW SAMPLE FOR AI ====================
def get_data_summary_for_ai(df: pd.DataFrame) -> str:
    """Build a compact text summary of the dataset to send to AI (NEVER full data)."""
    sample = df.head(3).to_string()
    types = "\n".join([f"  - {col}: {df[col].dtype}" for col in df.columns])
    summary = f"""
Dataset Info:
- Rows: {len(df)}
- Columns: {len(df.columns)}

Column Names & Types:
{types}

First 3 Rows (preview):
{sample}
"""
    return summary


# ==================== SAFE CODE EXECUTION ====================
# Whitelist of safe modules/functions AI can use
SAFE_GLOBALS = {
    "pd": pd,
    "np": np,
    "plt": plt,
    "sns": sns,
    "len": len,
    "range": range,
    "sum": sum,
    "min": min,
    "max": max,
    "abs": abs,
    "round": round,
    "sorted": sorted,
    "list": list,
    "dict": dict,
    "tuple": tuple,
    "set": set,
    "str": str,
    "int": int,
    "float": float,
    "bool": bool,
    "print": print,
    "enumerate": enumerate,
    "zip": zip,
    "map": map,
    "filter": filter,
    "any": any,
    "all": all,
}

# Dangerous keywords to block
BLOCKED_KEYWORDS = [
    "import os", "import sys", "import subprocess", "import shutil",
    "open(", "eval(", "exec(", "__import__", "compile(",
    "globals(", "locals(", "vars(", "dir(",
    "delattr", "setattr", "getattr", "input(",
    "file(", "input(", "raw_input(",
    ".system(", ".popen(", ".call(", ".run(",
]


def is_code_safe(code: str) -> Tuple[bool, str]:
    """Check if AI-generated code is safe to execute."""
    code_lower = code.lower()
    for keyword in BLOCKED_KEYWORDS:
        if keyword.lower() in code_lower:
            return False, f"Blocked keyword detected: {keyword}"
    return True, "OK"


def execute_code_safely(code: str, df: pd.DataFrame) -> Dict[str, Any]:
    """
    Execute AI-generated Python code on the user's DataFrame.
    Returns dict with: success, result, chart_path, error, output_type
    """
    result = {
        "success": False,
        "result": None,
        "chart_path": None,
        "error": None,
        "output_type": "text",  # text, chart, table, number
    }

    # 1. Safety check
    safe, msg = is_code_safe(code)
    if not safe:
        result["error"] = f"Security check failed: {msg}"
        return result

    # 2. Prepare execution environment
    os.makedirs(CHARTS_DIR, exist_ok=True)
    plt.close('all')  # Clear any previous plots

    local_vars = {
        "df": df.copy(),
        "result": None,
    }

    try:
        # Execute the code in a restricted namespace
        exec(code, SAFE_GLOBALS, local_vars)

        # Check if a chart was generated
        if plt.get_fignums():
            chart_filename = f"chart_{uuid.uuid4().hex[:12]}.png"
            chart_path = os.path.join(CHARTS_DIR, chart_filename)
            plt.tight_layout()
            plt.savefig(chart_path, dpi=120, bbox_inches='tight', facecolor='white')
            plt.close('all')
            result["chart_path"] = chart_path
            result["output_type"] = "chart"
            result["success"] = True
            return result

        # Otherwise, check the 'result' variable
        output = local_vars.get("result")

        if output is None:
            result["result"] = "Code executed successfully (no output)."
            result["output_type"] = "text"
        elif isinstance(output, pd.DataFrame):
            result["result"] = output.head(50).fillna("").astype(str).to_dict(orient="records")
            result["output_type"] = "table"
        elif isinstance(output, pd.Series):
            result["result"] = output.head(50).fillna("").astype(str).to_dict()
            result["output_type"] = "table"
        elif isinstance(output, (int, float, np.integer, np.floating)):
            result["result"] = float(output)
            result["output_type"] = "number"
        else:
            result["result"] = str(output)
            result["output_type"] = "text"

        result["success"] = True
        return result

    except Exception as e:
        plt.close('all')
        result["error"] = f"{type(e).__name__}: {str(e)}"
        result["traceback"] = traceback.format_exc()
        return result


# ==================== CACHE LOADED DATAFRAMES ====================
# Simple in-memory cache so we don't re-read the same file constantly
_df_cache: Dict[str, pd.DataFrame] = {}


def load_dataset_cached(file_path: str) -> pd.DataFrame:
    """Load dataset with caching to avoid repeated disk reads."""
    if file_path in _df_cache:
        return _df_cache[file_path]
    df = read_dataset(file_path)
    _df_cache[file_path] = df
    return df


def clear_cache(file_path: Optional[str] = None):
    """Clear DataFrame cache."""
    if file_path:
        _df_cache.pop(file_path, None)
    else:
        _df_cache.clear()