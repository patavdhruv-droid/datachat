"""
DataChat - Main FastAPI Server
All API endpoints for the application.
Run: uvicorn app:app --reload
"""

import os
import json
from datetime import timedelta
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

from models import (
    init_db, get_db, User, Dataset, Analysis, Message, Insight
)
from auth import (
    create_user, authenticate_user, create_access_token,
    get_current_user, get_user_by_email, ACCESS_TOKEN_EXPIRE_MINUTES
)
from data_handler import (
    save_uploaded_file, read_dataset, analyze_dataset,
    get_data_summary_for_ai, execute_code_safely, load_dataset_cached
)
from ai_engine import (
    generate_code, generate_insights, generate_chat_reply, generate_analysis_title
)
from chart_generator import chart_to_base64, delete_chart

load_dotenv()

# ==================== APP CONFIG ====================
app = FastAPI(
    title="DataChat API",
    description="AI-powered data analyst — talk to your spreadsheets.",
    version="1.0.0",
)

# CORS - allow frontend to talk to backend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve chart images as static files
os.makedirs("./charts", exist_ok=True)
app.mount("/charts", StaticFiles(directory="./charts"), name="charts")

# Initialize DB on startup
@app.on_event("startup")
def startup_event():
    init_db()
    print("🚀 DataChat API ready!")


# ==================== PYDANTIC MODELS ====================
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class ChatRequest(BaseModel):
    analysis_id: int
    question: str

class CreateAnalysisRequest(BaseModel):
    dataset_id: int
    title: Optional[str] = None


# ==================== ROOT ====================
@app.get("/")
def root():
    return {
        "app": "DataChat API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }


# ==================== AUTH ROUTES ====================
@app.post("/api/auth/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = create_user(db, payload.name, payload.email, payload.password)
    token = create_access_token(
        data={"user_id": user.id, "email": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan": user.plan,
        },
    }


@app.post("/api/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with email + password. Uses OAuth2 form (email goes in 'username' field)."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        data={"user_id": user.id, "email": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan": user.plan,
        },
    }


@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Get current logged-in user info."""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "plan": current_user.plan,
        "created_at": current_user.created_at.isoformat(),
    }


# ==================== DATASET ROUTES ====================
@app.post("/api/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a CSV/Excel file."""
    # Validate file type
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")

    # Read file bytes
    contents = await file.read()
    max_size_mb = int(os.getenv("MAX_FILE_SIZE_MB", 200))
    if len(contents) > max_size_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large (max {max_size_mb}MB)")

    # Save file
    file_path, unique_name = save_uploaded_file(contents, file.filename, current_user.id)

    # Analyze it
    try:
        df = read_dataset(file_path)
        meta = analyze_dataset(df)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    # Save to DB
    dataset = Dataset(
        user_id=current_user.id,
        filename=unique_name,
        original_name=file.filename,
        file_path=file_path,
        file_size_mb=round(len(contents) / (1024 * 1024), 2),
        rows=meta["rows"],
        columns=meta["columns"],
        column_names=json.dumps(meta["column_names"]),
        column_types=json.dumps(meta["column_types"]),
        missing_values=meta["missing_values"],
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return {
        "id": dataset.id,
        "filename": dataset.original_name,
        "rows": dataset.rows,
        "columns": dataset.columns,
        "size_mb": dataset.file_size_mb,
        "column_info": meta["column_info"],
        "preview": meta["preview"],
        "uploaded_at": dataset.uploaded_at.isoformat(),
    }


@app.get("/api/datasets")
def list_datasets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all datasets for current user."""
    datasets = db.query(Dataset).filter(Dataset.user_id == current_user.id).order_by(Dataset.uploaded_at.desc()).all()
    return [
        {
            "id": d.id,
            "filename": d.original_name,
            "rows": d.rows,
            "columns": d.columns,
            "size_mb": d.file_size_mb,
            "uploaded_at": d.uploaded_at.isoformat(),
        }
        for d in datasets
    ]


@app.get("/api/datasets/{dataset_id}")
def get_dataset(dataset_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get full details of a dataset."""
    d = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = load_dataset_cached(d.file_path)
    meta = analyze_dataset(df)

    return {
        "id": d.id,
        "filename": d.original_name,
        "rows": d.rows,
        "columns": d.columns,
        "size_mb": d.file_size_mb,
        "missing_values": d.missing_values,
        "column_info": meta["column_info"],
        "preview": meta["preview"],
        "uploaded_at": d.uploaded_at.isoformat(),
    }


@app.delete("/api/datasets/{dataset_id}")
def delete_dataset(dataset_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a dataset and its file."""
    d = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Delete file from disk
    if os.path.exists(d.file_path):
        os.remove(d.file_path)

    db.delete(d)
    db.commit()
    return {"message": "Dataset deleted"}


# ==================== ANALYSIS ROUTES ====================
@app.post("/api/analyses")
def create_analysis(payload: CreateAnalysisRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new chat/analysis session for a dataset."""
    dataset = db.query(Dataset).filter(Dataset.id == payload.dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    analysis = Analysis(
        user_id=current_user.id,
        dataset_id=dataset.id,
        title=payload.title or f"Analysis of {dataset.original_name}",
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "id": analysis.id,
        "title": analysis.title,
        "dataset_id": dataset.id,
        "dataset_name": dataset.original_name,
        "created_at": analysis.created_at.isoformat(),
    }


@app.get("/api/analyses")
def list_analyses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all analyses for current user."""
    analyses = db.query(Analysis).filter(Analysis.user_id == current_user.id).order_by(Analysis.updated_at.desc()).all()
    result = []
    for a in analyses:
        msg_count = db.query(Message).filter(Message.analysis_id == a.id).count()
        result.append({
            "id": a.id,
            "title": a.title,
            "dataset_id": a.dataset_id,
            "dataset_name": a.dataset.original_name if a.dataset else "Deleted",
            "message_count": msg_count,
            "created_at": a.created_at.isoformat(),
            "updated_at": a.updated_at.isoformat(),
        })
    return result


@app.get("/api/analyses/{analysis_id}")
def get_analysis(analysis_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get full analysis with all messages."""
    a = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")

    messages = db.query(Message).filter(Message.analysis_id == a.id).order_by(Message.created_at).all()
    insights = db.query(Insight).filter(Insight.analysis_id == a.id).all()

    return {
        "id": a.id,
        "title": a.title,
        "dataset_id": a.dataset_id,
        "dataset_name": a.dataset.original_name if a.dataset else None,
        "created_at": a.created_at.isoformat(),
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "code": m.code,
                "chart_url": f"/charts/{os.path.basename(m.chart_path)}" if m.chart_path else None,
                "result_data": json.loads(m.result_data) if m.result_data else None,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ],
        "insights": [
            {"id": i.id, "title": i.title, "description": i.description, "category": i.category}
            for i in insights
        ],
    }


@app.delete("/api/analyses/{analysis_id}")
def delete_analysis(analysis_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete an analysis."""
    a = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Delete associated charts
    for msg in a.messages:
        if msg.chart_path:
            delete_chart(msg.chart_path)

    db.delete(a)
    db.commit()
    return {"message": "Analysis deleted"}


# ==================== CHAT ROUTE (THE CORE!) ====================
@app.post("/api/chat")
def chat(payload: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    THE CORE ENDPOINT.
    User asks a question → AI writes code → Code executes safely → Result returned.
    """
    # 1. Get analysis & dataset
    analysis = db.query(Analysis).filter(
        Analysis.id == payload.analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    dataset = db.query(Dataset).filter(Dataset.id == analysis.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # 2. Load dataframe
    try:
        df = load_dataset_cached(dataset.file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dataset: {str(e)}")

    # 3. Save user message
    user_msg = Message(
        analysis_id=analysis.id,
        role="user",
        content=payload.question,
    )
    db.add(user_msg)
    db.commit()

    # 4. Get data summary for AI (only metadata, never actual data)
    data_summary = get_data_summary_for_ai(df)

    # 5. Generate Python code from Groq
    try:
        code = generate_code(payload.question, data_summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI failed to generate code: {str(e)}")

    # 6. Execute code safely
    exec_result = execute_code_safely(code, df)

    # 7. Build response content
    if not exec_result["success"]:
        reply_text = f"❌ I couldn't complete that analysis. Error: {exec_result['error']}"
        result_data = None
        chart_url = None
    else:
        # Build a short reply based on output type
        if exec_result["output_type"] == "chart":
            reply_text = generate_chat_reply(payload.question, "A chart was generated.")
        elif exec_result["output_type"] == "number":
            reply_text = generate_chat_reply(payload.question, f"Result: {exec_result['result']}")
        elif exec_result["output_type"] == "table":
            preview = str(exec_result["result"])[:500]
            reply_text = generate_chat_reply(payload.question, f"Table preview: {preview}")
        else:
            reply_text = str(exec_result["result"])[:500]

        result_data = exec_result["result"] if exec_result["output_type"] != "chart" else None
        chart_url = (
            f"/charts/{os.path.basename(exec_result['chart_path'])}"
            if exec_result["chart_path"] else None
        )

    # 8. Save assistant message
    assistant_msg = Message(
        analysis_id=analysis.id,
        role="assistant",
        content=reply_text,
        code=code,
        chart_path=exec_result.get("chart_path"),
        result_data=json.dumps(result_data, default=str) if result_data else None,
    )
    db.add(assistant_msg)

    # 9. Auto-update analysis title if it's the first message
    msg_count = db.query(Message).filter(Message.analysis_id == analysis.id).count()
    if msg_count <= 2 and analysis.title.startswith("Analysis of"):
        try:
            new_title = generate_analysis_title(payload.question)
            analysis.title = new_title
        except Exception:
            pass

    db.commit()
    db.refresh(assistant_msg)

    # 10. Generate insights in background (only on success)
    insights_list = []
    if exec_result["success"] and exec_result["output_type"] in ["chart", "table", "number"]:
        try:
            result_preview = str(exec_result["result"])[:1000] if exec_result["result"] else "Chart generated"
            insights_list = generate_insights(payload.question, data_summary, result_preview)
            # Save insights to DB
            for ins_text in insights_list:
                ins = Insight(
                    analysis_id=analysis.id,
                    title=ins_text[:80],
                    description=ins_text,
                    category="auto",
                )
                db.add(ins)
            db.commit()
        except Exception as e:
            print(f"⚠️  Insight generation failed: {e}")

    # 11. Return response
    return {
        "message_id": assistant_msg.id,
        "role": "assistant",
        "content": reply_text,
        "code": code,
        "chart_url": chart_url,
        "result_data": result_data,
        "output_type": exec_result["output_type"],
        "success": exec_result["success"],
        "error": exec_result.get("error"),
        "insights": insights_list,
        "analysis_title": analysis.title,
    }


# ==================== INSIGHTS ROUTE ====================
@app.get("/api/insights")
def get_all_insights(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all insights across all analyses for the user."""
    insights = (
        db.query(Insight)
        .join(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Insight.created_at.desc())
        .all()
    )
    return [
        {
            "id": i.id,
            "title": i.title,
            "description": i.description,
            "category": i.category,
            "analysis_id": i.analysis_id,
            "created_at": i.created_at.isoformat(),
        }
        for i in insights
    ]


# ==================== ACCOUNT ROUTE ====================
@app.get("/api/account/stats")
def get_account_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's usage stats."""
    dataset_count = db.query(Dataset).filter(Dataset.user_id == current_user.id).count()
    analysis_count = db.query(Analysis).filter(Analysis.user_id == current_user.id).count()
    message_count = (
        db.query(Message).join(Analysis).filter(Analysis.user_id == current_user.id).count()
    )
    insight_count = (
        db.query(Insight).join(Analysis).filter(Analysis.user_id == current_user.id).count()
    )

    return {
        "plan": current_user.plan,
        "datasets": dataset_count,
        "analyses": analysis_count,
        "messages": message_count,
        "insights": insight_count,
        "limits": {
            "datasets": 5 if current_user.plan == "free" else 100,
            "analyses_per_month": 100 if current_user.plan == "free" else 10000,
        },
    }


# ==================== HEALTH CHECK ====================
@app.get("/health")
def health():
    return {"status": "ok"}

# ==================== HUGGING FACE COMPATIBILITY ====================
import sys
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)