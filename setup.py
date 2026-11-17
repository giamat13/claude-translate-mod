"""Optional offline fallback: creates .venv and installs Argos Translate with the he->en model."""
import subprocess
import sys
import venv
from pathlib import Path

root = Path(__file__).resolve().parent
env = root / ".venv"
if not env.exists():
    venv.create(env, with_pip=True)
py = env / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
subprocess.check_call([str(py), "-m", "pip", "install", "-r", str(root / "requirements.txt")])
subprocess.check_call(
    [
        str(py),
        "-c",
        "import argostranslate.package as p;p.update_package_index();"
        "[p.install_from_path(x.download()) for x in p.get_available_packages() if x.from_code=='he' and x.to_code=='en']",
    ]
)
print("Done. Offline Hebrew->English fallback is ready.")
