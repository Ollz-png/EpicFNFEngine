import os
import zipfile
from pathlib import Path

# ---------- CONFIG ----------
# Path to the unpacked project folder (everything inside original .sb3/.pmp)
PROJECT_FOLDER = Path(__file__).parent.parent / "projectSource"
OUTPUT_FILE = Path(__file__).parent.parent / "Project.pmp"
# ----------------------------

def zip_folder(folder_path, output_file):
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                file_path = Path(root) / file
                # Create archive path relative to project folder
                arcname = file_path.relative_to(folder_path)
                zipf.write(file_path, arcname)
    print(f"Packed project into {output_file}")

if __name__ == "__main__":
    zip_folder(PROJECT_FOLDER, OUTPUT_FILE)
