"""Render resume outputs from data/data.yaml using templates."""

from __future__ import annotations

import argparse
import os
import tomllib
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "data.yaml"
TEMPLATES_DIR = ROOT / "templates"
PYPROJECT_FILE = ROOT / "pyproject.toml"


def get_version_from_pyproject() -> str:
    """Read version from pyproject.toml."""
    try:
        with PYPROJECT_FILE.open("rb") as f:
            pyproject = tomllib.load(f)
            version = pyproject.get("project", {}).get("version", "0.0.0")
            return f"v{version}"
    except (FileNotFoundError, KeyError):
        return "v0.0.0"


class ValidationError(Exception):
    """Raised when resume data validation fails."""


def load_data(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def validate(data: dict[str, Any]) -> None:
    """Validate resume data for consistency and constraints."""
    # Duplicate experience IDs
    ex_ids = [e["id"] for e in data.get("experiences", [])]
    dup = {x for x in ex_ids if ex_ids.count(x) > 1}
    if dup:
        msg = f'Duplicate experience id(s): {", ".join(sorted(dup))}'
        raise ValidationError(msg)

    # Duplicate bullet IDs (global)
    bullets = []
    for e in data.get("experiences", []):
        for b in e.get("bullets", []):
            bullets.extend([b.get("id")])
    dup_b = {x for x in bullets if bullets.count(x) > 1}
    if dup_b:
        msg = f'Duplicate bullet id(s): {", ".join(sorted(dup_b))}'
        raise ValidationError(msg)

    # Bullet length
    max_len = data.get("config", {}).get("max_bullet_length", 1000)
    for e in data.get("experiences", []):
        for b in e.get("bullets", []):
            text = b.get("text", "")
            if len(text) > max_len:
                bullet_id = b.get("id")
                msg = f"Bullet '{bullet_id}' exceeds max length ({len(text)} > {max_len})"
                raise ValidationError(msg)


def apply_profile(data: dict[str, Any], profile_name: str) -> dict[str, Any]:
    """Apply a profile to filter experiences and bullets."""
    profiles = data.get("profiles", {})
    if profile_name not in profiles:
        msg = f"Missing profile: {profile_name}"
        raise ValidationError(msg)
    profile = profiles[profile_name]

    def tag_pass(bul: dict[str, Any]) -> bool:
        inc = profile.get("include_tags")
        exc = profile.get("exclude_tags")
        btags = set(bul.get("tags") or [])
        if inc and not btags.intersection(set(inc)):
            return False

        return not (exc and btags.intersection(set(exc)))

    min_imp = profile.get("min_importance", 1)
    max_per = profile.get("max_bullets_per_experience", 5)

    out_exps = []
    for e in data.get("experiences", []):
        # filter bullets
        bullets = [b for b in e.get("bullets", []) if b.get("importance", 0) >= min_imp and tag_pass(b)]
        # stable sort by importance descending
        bullets = sorted(bullets, key=lambda b: (-int(b.get("importance", 0)),))
        # truncate
        bullets = bullets[: int(max_per)]
        out_exps.append({**e, "bullets": bullets})

    return {**data, "experiences": out_exps}


def create_jinja_env() -> Environment:
    """Create and configure Jinja2 environment."""
    return Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(
            enabled_extensions=("html", "xml"),
            disabled_extensions=("typ",),
            default_for_string=False,
        ),
    )


def get_build_info() -> dict[str, Any]:
    """Get build information from environment variables."""
    tag = get_version_from_pyproject() or os.environ.get("RELEASE_TAG")
    commit = os.environ.get("GITHUB_SHA", "unknown")
    commit_short = commit[:7] if commit != "unknown" else "unknown"
    repo = os.environ.get("GITHUB_REPOSITORY", "weialbert/resume")

    return {
        "tag": tag,
        "date": datetime.now(ZoneInfo("US/Eastern")).strftime("%Y-%m-%d %H:%M UTC"),
        "commit_short": commit_short,
        "commit_url": f"https://github.com/{repo}/commit/{commit}",
        "release_url": f"https://github.com/{repo}/releases/tag/{tag}" if tag != "dev" else f"https://github.com/{repo}",
    }


def render_index(env: Environment, data: dict[str, Any]) -> str:
    """Render index.html landing page with data from YAML."""
    template = env.get_template("index.html.j2")
    return template.render(
        name=data["personal"]["name"],
        title=data.get("title", ""),
        contact=data.get("personal", {}),
        build_info=get_build_info(),
    )


def render_template(env: Environment, template_name: str, context: dict[str, Any]) -> str:
    """Render a template with the given context."""
    tmpl = env.get_template(template_name)
    return tmpl.render(**context)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--profile", default=None)
    parser.add_argument("--format", choices=("md", "typst", "html", "index"), required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args(argv)

    try:
        data = load_data(DATA_FILE)
        validate(data)
    except ValidationError:
        return 1

    # Create Jinja environment once
    env = create_jinja_env()

    # Handle index format separately
    if args.format == "index":
        out = render_index(env, data)
    # Common context for md and html
    elif args.format in ("md", "html"):
        ctx = {
            "experiences": data.get("experiences", []),
            "projects": data.get("projects", []),
            "education": data.get("education", []),
            "skills": data.get("skills", []),
            "personal": data.get("personal", {}),
        }
        template = f"resume.{args.format}.j2"
        out = render_template(env, template, ctx)
    elif args.format == "typst":
        if not args.profile:
            return 1
        try:
            filtered = apply_profile(data, args.profile)
        except ValidationError:
            return 1
        ctx = {
            "personal": data.get("personal", {}),
            "experiences": filtered.get("experiences", []),
            "projects": data.get("projects", []),
            "education": data.get("education", []),
            "skills": data.get("skills", []),
            "publications": data.get("publications", []),
        }
        template = "resume.typ.j2"
        out = render_template(env, template, ctx)

    # Write output
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(out, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
