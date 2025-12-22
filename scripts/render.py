#!/usr/bin/env python3
"""Render resume outputs from data/experience.yaml using templates.

Usage:
  python render.py --profile <profile-name> --format md|typst --output <path>
"""
from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any, Dict, List

import yaml
from jinja2 import Environment, FileSystemLoader


ROOT = Path(__file__).resolve().parents[1]  # resume/ directory
DATA_FILE = ROOT / "data" / "experience.yaml"
TEMPLATES_DIR = ROOT / "templates"


def load_data(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def validate(data: Dict[str, Any]) -> None:
    # Duplicate experience IDs
    ex_ids = [e["id"] for e in data.get("experiences", [])]
    dup = {x for x in ex_ids if ex_ids.count(x) > 1}
    if dup:
        raise SystemExit(f"Duplicate experience id(s): {', '.join(sorted(dup))}")

    # Duplicate bullet IDs (global)
    bullets = []
    for e in data.get("experiences", []):
        for b in e.get("bullets", []):
            bullets.append(b.get("id"))
    dup_b = {x for x in bullets if bullets.count(x) > 1}
    if dup_b:
        raise SystemExit(f"Duplicate bullet id(s): {', '.join(sorted(dup_b))}")

    # Bullet length
    max_len = data.get("config", {}).get("max_bullet_length", 1000)
    for e in data.get("experiences", []):
        for b in e.get("bullets", []):
            text = b.get("text", "")
            if len(text) > max_len:
                raise SystemExit(f"Bullet '{b.get('id')}' exceeds max length ({len(text)} > {max_len})")


def apply_profile(data: Dict[str, Any], profile_name: str) -> Dict[str, Any]:
    profiles = data.get("profiles", {})
    if profile_name not in profiles:
        raise SystemExit(f"Missing profile: {profile_name}")
    profile = profiles[profile_name]

    def tag_pass(bul: Dict[str, Any]) -> bool:
        inc = profile.get("include_tags")
        exc = profile.get("exclude_tags")
        btags = set(bul.get("tags") or [])
        if inc:
            # require at least one include tag
            if not btags.intersection(set(inc)):
                return False
        if exc:
            if btags.intersection(set(exc)):
                return False
        return True

    min_imp = profile.get("min_importance", 1)
    max_per = profile.get("max_bullets_per_experience", 5)

    out_exps = []
    for e in data.get("experiences", []):
        # filter bullets
        bullets = [b for b in e.get("bullets", []) if b.get("importance", 0) >= min_imp and tag_pass(b)]
        # stable sort by importance descending
        bullets = sorted(bullets, key=lambda b: (-int(b.get("importance", 0)),))
        # truncate
        bullets = bullets[:int(max_per)]
        out_exps.append({**e, "bullets": bullets})

    return {**data, "experiences": out_exps}


def render_template(template_name: str, context: Dict[str, Any]) -> str:
    env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)), autoescape=False)
    tmpl = env.get_template(template_name)
    return tmpl.render(**context)


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--profile", default=None)
    parser.add_argument("--format", choices=("md", "typst"), required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args(argv)

    data = load_data(DATA_FILE)
    validate(data)

    if args.format == "md":
        # Markdown includes all bullets; include all available sections
        ctx = {
            "experiences": data.get("experiences", []),
            "projects": data.get("projects", []),
            "education": data.get("education", []),
            "skills": data.get("skills", []),
            "personal": data.get("personal", {}),
        }
        out = render_template("resume.md.tmpl", ctx)
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        Path(args.output).write_text(out, encoding="utf-8")
        print(f"Wrote {args.output}")
        return 0

    # typst requires a profile and supports the same sections; experiences are filtered by profile
    if args.format == "typst":
        if not args.profile:
            raise SystemExit("Missing --profile for typst output")
        filtered = apply_profile(data, args.profile)
        ctx = {
            "experiences": filtered.get("experiences", []),
            "projects": data.get("projects", []),
            "education": data.get("education", []),
            "skills": data.get("skills", []),
            "personal": data.get("personal", {}),
        }
        out = render_template("resume.typ.tmpl", ctx)
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        Path(args.output).write_text(out, encoding="utf-8")
        print(f"Wrote {args.output}")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
