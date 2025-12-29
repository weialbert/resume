# Resume

This repository builds a resume using Typst and simple templates.

Quick start

Prerequisites:
- Python 3.11+ (or system Python)
- typst (https://typst.org) or installable via Rust/Cargo
- Ghostscript (for ensuring final PDF size and letter paper)

Install Python deps:

```bash
# Install uv (recommended) and sync dependencies from pyproject.toml
python -m pip install --user uv
uv sync
```

Lockfile

`uv.lock` is included in this repository to pin dependency versions for reproducible installs.
To update or regenerate the lock run:

```bash
# Install or update uv, then generate lock
python -m pip install --user uv
uv lock
# Commit the generated `uv.lock` file
git add uv.lock && git commit -m "chore: update uv.lock"
```

If you prefer using pipx to install CLI tools:

```bash
pipx install uv
```

Build (all):

```bash
uv run make
```

Build only markdown or PDF:

```bash
uv run make md
uv run make pdf
```

Watch for changes

```bash
# Rebuild automatically when templates, data, or scripts change
# Requires a watcher: install **watchexec** (recommended) or **fswatch** / **entr**
make watch
# or explicitly use uv-runner if you prefer:
uv run make watch
```

Notes

- On macOS, `brew install watchexec` is recommended for reliable cross-platform watching.
- `fswatch` or `entr` also work if you already have them installed.

Notes

- The Makefile will attempt to install Python deps to the user site if they are missing.
- CI will run `uv run make` and verify that `build/resume.pdf` is created.
- For local typst development, you can install typst via `cargo install typst` or use a platform-specific binary.
