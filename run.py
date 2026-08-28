import os
import sys
import subprocess
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def run_backend():
    """Starts the FastAPI backend server."""
    print("[RUNNER] Starting FastAPI Backend on http://127.0.0.1:8000...")
    venv_python = BASE_DIR / "venv" / "Scripts" / "python.exe"
    if not venv_python.exists():
        venv_python = sys.executable

    cmd = [str(venv_python), "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
    return subprocess.Popen(cmd, cwd=str(BASE_DIR))

def run_frontend():
    """Starts the Next.js frontend application."""
    print("[RUNNER] Starting Next.js Frontend on http://localhost:3000...")
    frontend_dir = BASE_DIR / "frontend"
    cmd = ["npm.cmd", "run", "dev"]
    return subprocess.Popen(cmd, cwd=str(frontend_dir), shell=True)

def main():
    print("=" * 60)
    print("  OPEN-SOURCE LOCAL-FIRST AI AGENT RUNTIME MVP")
    print("=" * 60)
    
    env_file = BASE_DIR / ".env"
    if not env_file.exists():
        print("[WARNING] .env file not found. Creating from .env.example...")

    backend_proc = run_backend()
    time.sleep(2)
    frontend_proc = run_frontend()

    print("\n[SUCCESS] Systems initialized!")
    print(" - Backend API:  http://127.0.0.1:8000")
    print(" - Frontend UI:  http://localhost:3000")
    print(" Press Ctrl+C to stop servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n[RUNNER] Shutting down agent runtime servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
