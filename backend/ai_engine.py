"""
DataChat - AI Engine
Uses Groq (Llama 3) to convert natural language questions into Python code.
This is the BRAIN of DataChat.
"""

import os
import re
from groq import Groq
from dotenv import load_dotenv
from typing import List

load_dotenv()

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found in .env file!")
else:
    print(f"🔑 GROQ KEY LOADED: {GROQ_API_KEY[:15]}...{GROQ_API_KEY[-8:]} (length: {len(GROQ_API_KEY)})")

client = Groq(api_key=GROQ_API_KEY)

# Use Llama 3.3 70B - fast and accurate
MODEL = "llama-3.3-70b-versatile"


# ==================== SYSTEM PROMPT (CODE GENERATION) ====================
CODE_SYSTEM_PROMPT = (
    "You are DataChat, an expert Python data analyst.\n\n"
    "Your job is to convert user questions into clean, executable Python code "
    "that analyzes a Pandas DataFrame called df.\n\n"
    "STRICT RULES (FOLLOW EXACTLY):\n"
    "1. DataFrame variable is always df (already loaded, do not reload).\n"
    "2. Available libraries: pandas (pd), numpy (np), matplotlib.pyplot (plt), seaborn (sns).\n"
    "3. For charts: Use plt or sns. Do NOT call plt.show() - chart is auto-saved.\n"
    "4. For data/numbers/tables: Store the final output in a variable called result.\n"
    "5. For charts: Use beautiful styling. Add title, axis labels, use sns.color_palette('viridis').\n"
    "6. Output ONLY raw Python code - no explanations, no markdown, no code fences.\n"
    "7. NEVER use: import os, sys, subprocess, open(), eval(), exec(), __import__.\n"
    "8. Handle missing data: Use .dropna() or .fillna() where appropriate.\n"
    "9. For large groupby results: Limit to top 20 with .head(20).\n"
    "10. Always use figsize=(10, 6) for charts.\n\n"
    "EXAMPLES:\n\n"
    "User: Show revenue by product\n"
    "result = df.groupby('Product')['Revenue'].sum().sort_values(ascending=False).head(20)\n"
    "plt.figure(figsize=(10, 6))\n"
    "sns.barplot(x=result.values, y=result.index, palette='viridis')\n"
    "plt.title('Revenue by Product', fontsize=14, fontweight='bold')\n"
    "plt.xlabel('Revenue')\n"
    "plt.ylabel('Product')\n\n"
    "User: What is the average sales?\n"
    "result = df['Sales'].mean()\n\n"
    "User: Top 5 customers by total spent\n"
    "result = df.groupby('Customer')['Amount'].sum().sort_values(ascending=False).head(5)\n\n"
    "Now generate code for the user's question. Output ONLY code."
)


# ==================== SYSTEM PROMPT (INSIGHTS) ====================
INSIGHT_SYSTEM_PROMPT = (
    "You are a senior business analyst at DataChat.\n\n"
    "Given a user's question, the dataset summary, and the analysis result, "
    "generate 2-3 SHORT business insights.\n\n"
    "RULES:\n"
    "1. Each insight should be 1-2 sentences max.\n"
    "2. Be specific - use numbers and percentages.\n"
    "3. Sound professional, like a McKinsey consultant.\n"
    "4. Focus on what matters for business decisions.\n"
    "5. Output as a numbered list:\n"
    "   1. First insight here.\n"
    "   2. Second insight here.\n"
    "   3. Third insight here (optional).\n\n"
    "Be brief, punchy, and valuable."
)


# ==================== CLEAN AI CODE OUTPUT ====================
def clean_code(raw_code: str) -> str:
    """Remove markdown fences and clean up AI-generated code."""
    code = raw_code.strip()

    # Remove python code fences
    code = re.sub(r"^```python\s*", "", code, flags=re.MULTILINE)
    code = re.sub(r"^```\s*", "", code, flags=re.MULTILINE)
    code = re.sub(r"```$", "", code, flags=re.MULTILINE)

    code = code.strip()
    return code


# ==================== GENERATE PYTHON CODE ====================
def generate_code(question: str, data_summary: str) -> str:
    """Send user question + data summary to Groq. Returns clean Python code."""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": CODE_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Dataset Info:\n{data_summary}\n\nQuestion:\n{question}\n\nGenerate Python code:"
                },
            ],
            temperature=0.2,
            max_tokens=1024,
        )
        raw_code = response.choices[0].message.content
        return clean_code(raw_code)
    except Exception as e:
        raise RuntimeError(f"AI code generation failed: {str(e)}")


# ==================== GENERATE INSIGHTS ====================
def generate_insights(question: str, data_summary: str, result_preview: str) -> List[str]:
    """Given the analysis result, generate business insights."""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": INSIGHT_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"Dataset:\n{data_summary}\n\n"
                        f"User asked:\n{question}\n\n"
                        f"Analysis result:\n{result_preview}\n\n"
                        f"Generate 2-3 business insights:"
                    ),
                },
            ],
            temperature=0.7,
            max_tokens=400,
        )
        text = response.choices[0].message.content.strip()

        # Parse numbered list into individual insights
        insights = []
        for line in text.split("\n"):
            line = line.strip()
            match = re.match(r"^(?:\d+[\.\)]|[-•])\s*(.+)$", line)
            if match:
                insights.append(match.group(1).strip())

        if not insights and text:
            insights = [text]

        return insights[:3]
    except Exception as e:
        print(f"Insight generation failed: {e}")
        return []


# ==================== SMART CHAT REPLY ====================
def generate_chat_reply(question: str, result_summary: str) -> str:
    """Generate a short conversational reply explaining the result."""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are DataChat, a friendly data analyst. "
                        "Given a user's question and the analysis result, write a SHORT 1-2 sentence "
                        "conversational reply explaining the answer. Be friendly and direct. "
                        "Do not repeat the data - just give the takeaway."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Question: {question}\n\nResult: {result_summary}\n\nReply:",
                },
            ],
            temperature=0.6,
            max_tokens=150,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return "Here's your analysis result."


# ==================== AUTO-SUGGEST ANALYSIS TITLE ====================
def generate_analysis_title(first_question: str) -> str:
    """Generate a short title for an analysis based on the first question."""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Generate a 3-5 word title for an analysis based on the user's question. Output ONLY the title, no quotes, no punctuation.",
                },
                {"role": "user", "content": first_question},
            ],
            temperature=0.5,
            max_tokens=20,
        )
        title = response.choices[0].message.content.strip().strip('"').strip("'")
        return title[:60]
    except Exception:
        return "New Analysis"