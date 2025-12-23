# Resume

This repository generates templated, version-controlled resumes from a single structured [data file](data/data.yaml). Resume content is rendered using Jinja2 templates into Typst, Markdown, and HTML outputs. Output variants are controlled through configurable `profiles`, which filter and shape content to produce different resume targets, including:

- A **one-page Typst-generated PDF** for file submission  
- **Role-specific resumes** that include only bullet points matching selected tags or criteria  
- A **complete HTML resume** optimized for quick copying into online application forms  

> [!NOTE]  
> The live resume is hosted on GitHub Pages and can be viewed here:  
> https://weialbert.github.io/resume/

## Outputs

All outputs are derived from the same underlying data and rendered via profile-specific templates:

| Format | Description |
| :---: | --- |
| `pdf` | A **one-page** PDF rendered via Typst, suitable for applications and submissions |
| `html` | A full resume rendered for the web, optimized for **copying and pasting** |
| `markdown` | The extended resume rendered as Markdown for reference or reuse |

## Quick Start

### Prerequisites

- Python 3.11+ (or system Python)
- Typst ([typst.org](https://typst.org)), installable directly or via Rust/Cargo

### Install Python dependencies

```bash
# Install uv (recommended) and sync dependencies from pyproject.toml
python -m pip install --user uv
uv sync
```
### Build all outputs
```bash
uv run make
```
### Build specific outputs
```bash
uv run make md
uv run make pdf
```
### Watch for changes
Automatically rebuild when data, templates, or scripts change.
```bash
# Requires a file watcher (watchexec recommended)
make watch
# or
uv run make watch
```
## Customization
### Editing resume data
All resume content is managed in a single file: data/data.yaml. You can update or add information in the following sections:

|Section	| Description |
|:---:|---|
|`profiles`|	Defines output-specific profiles. The PDF uses the onepage profile, which filters bullets by tag and importance, and enforces a max_bullets limit|
|`personal`|	Name, email, location, GitHub, and social links|
|`education`|	Degrees, institutions, graduation dates, GPA, and academic honors|
|`experience`|	Work history including roles, companies, dates, and key accomplishments|
|`publications`|	Papers, articles, blog posts, or research with titles, venues, and dates|
|`leadership`|	Leadership positions, organizations, dates, and impact|
|`projects`|	Personal, academic, or professional projects with descriptions and technologies|
|`skills`|	Technical skills, tools, languages, frameworks, and relevant soft skills|

## Continuous Integration
On every push, workflows defined in .github/workflows/ run automatically to ensure correctness and consistency:

### Successful builds
All outputs must build without errors. Invalid or malformed data will cause CI failures, and GitHub Pages will continue serving the most recent successful build.

### Profile compliance
Outputs must conform to their defined profiles. For example, the PDF must remain exactly one page. Exceeding limits (such as too many bullets without proper filtering by tags, importance, or max_bullets) or modifying the PDF profile incorrectly will cause CI to fail.
