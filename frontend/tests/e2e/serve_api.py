"""Start the real API with a migrated, disposable SQLite database."""
import os
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory

import uvicorn


def main():
    backend = Path(__file__).resolve().parents[3] / "backend"
    os.chdir(backend)
    sys.path.insert(0, str(backend))
    with TemporaryDirectory(prefix="aitrip-e2e-") as directory:
        os.environ["DATABASE_URL"] = f"sqlite:///{directory}/trips.db"
        subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
        uvicorn.run("app.main:app", host="127.0.0.1", port=48123)


if __name__ == "__main__":
    main()
